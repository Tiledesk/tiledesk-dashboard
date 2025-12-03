/// websocket.worker.ts
/// <reference lib="webworker" />
interface WSMessage {
    action?: string;
    event?: { topic: string; method: string };
    payload?: any;
  }
  
  interface Subscription {
    topic: string;
    label?: string;
  }
  
  let ws: WebSocket | null = null;
  let url = '';
  let reconnectInterval = 5000;
  let subscriptions: Subscription[] = [];
  let pendingMessages: any[] = [];
  
  
  let pingMsg = { action: "heartbeat", payload: { message: { text: "ping" } } }
  let pongMsg = { action: "heartbeat", payload: { message: { text: "pong" } } }
  const pongTimeout = 10000;
  const pingTimeout = 15000;
  let pingTimeoutId;
  let pongTimeoutId;
  
  let reconnectAttempts = 0;
  const maxReconnectDelay = 30000;
  let manuallyClosed = false;
  let pageHidden = false;
  
  onmessage = (e: MessageEvent) => {
    const { action, data } = e.data;
  
    switch (action) {
      case 'init':
        url = data.url;
        connect();
        break;
      case 'subscribe':
        const topic = data.topic || data.label;
        subscriptions.push({ topic });
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            action: 'subscribe',
            payload: {
              topic: topic,
              message: undefined,
              method: undefined
            }
          }));
        }
        break;
      case 'unsubscribe':
        subscriptions = subscriptions.filter(s => s.topic !== data.topic);
        if (ws && ws.readyState === WebSocket.OPEN) {
          // Unsubscribe
          ws.send(JSON.stringify({
            action: 'unsubscribe',
            payload: {
              topic: data.topic,
              message: undefined,
              method: undefined
            }
          }));
        }
        break;
      case 'visibility':  // ✅ Nuovo
        pageHidden = data.hidden;
        break;
      case 'send':
        sendMessage(data.message);
        break;
      case 'close':   // ✅ Nuovo
        closeConnection();
        break;
    }
  };
  
  function connect() {
    ws = new WebSocket(url);
    ws.onopen = () => {
      console.log('[Worker] WebSocket connected',subscriptions);
      // Risottiamo pending subscriptions
      subscriptions.forEach(s => {
        ws!.send(JSON.stringify({
          action: 'subscribe',
          payload: {
            topic: s.topic,
            message: undefined,
            method: undefined
          }
        }));
      }
      );
      // Invia messaggi in coda
      pendingMessages.forEach(msg => ws!.send(JSON.stringify(msg)));
      pendingMessages = [];
  
      // Inizializza heartbeat
      heartCheck();
      reconnectAttempts = 0;
    };
  
    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        handleMessage(msg);
      } catch (err) {
        console.error('[Worker] Invalid message', err);
      }
    };
  
    ws.onclose = () => {
      heartReset();
      if(!manuallyClosed){
        reconnectAttempts++;
        const delay = Math.min(reconnectAttempts * 1000, maxReconnectDelay);
        // console.log('[Worker] WebSocket disconnected, retry in', delay, 'ms');
        setTimeout(connect, delay);
      }
    };
  
    ws.onerror = (err) => {
    //   console.error('[Worker] WebSocket error', err);
      ws?.close();
    };
  }
  
  function handleMessage(msg: WSMessage) {
    console.log('[Worker] Received message:', msg);
    // --- GESTIONE PING/PONG ---
    if (msg.action === 'heartbeat' && msg.payload?.message?.text === 'ping') {
    //   console.log('[Worker] Received ping, sending pong');
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(pongMsg));
      }
      return;
    }
  
    if (msg.action !== "publish") return;
  
    const topic = msg.payload?.topic;
    const method = msg.payload?.method;
    const payload = msg.payload?.message;
  
    if (!topic) return;
    
    // Notifica solo le subscription che matchano
    subscriptions.forEach(sub => {
      if (sub.topic === topic) {
        postMessage({ topic, method, payload }, undefined);
      }
    });
  }
  
  function sendMessage(message: any) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      pendingMessages.push(message);
    }
  }
  
  
  // -----------------------------------------------------------------------------------------------------
  // @ HeartCheck
  // -----------------------------------------------------------------------------------------------------
  function heartCheck() {
    heartReset();
    heartStart();
  }
  
  // -----------------------------------------------------------------------------------------------------
  // @ HeartStart
  // -----------------------------------------------------------------------------------------------------
  function heartStart() {
    // this.getRemainingTime();
  
    // usa intervallo adattivo se tab è in background (Chrome throtla i timer)
    const adaptivePing = pageHidden ? pingTimeout * 3 : pingTimeout;
  
    // // pianifica invio ping
    pingTimeoutId = setTimeout(() => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
    //   console.log("[WEBSOCKET-JS] - HEART-START - SENDING PING ");
  
      // Qui viene inviato un battito cardiaco. Dopo averlo ricevuto, viene restituito un messaggio di battito cardiaco.
      // onmessage Ottieni il battito cardiaco restituito per indicare che la connessione è normale
      ws.send(JSON.stringify(pingMsg));
  
      // Se non viene ripristinato dopo un determinato periodo di tempo, il backend viene attivamente disconnesso
      pongTimeoutId = setTimeout(() => {
        // console.log("[WEBSOCKET-JS] - HEART-START - PONG-TIMEOUT-ID  - CLOSE WS ");
        // se onclose Si esibirà reconnect，Eseguiamo ws.close() Bene, se lo esegui direttamente reconnect Si innescherà onclose Causa riconnessione due volte
        ws.close();
      }, pongTimeout) as unknown as number;
    }, pingTimeout);
  
  }
  
  // -----------------------------------------------------------------------------------------------------
  // @ heartReset
  // -----------------------------------------------------------------------------------------------------
  function heartReset() {
    if (pongTimeoutId !== undefined) {
      clearTimeout(pongTimeoutId);
      pongTimeoutId = undefined;
    }
  
    if (pingTimeoutId !== undefined) {
      clearTimeout(pingTimeoutId);
      pingTimeoutId = undefined;
    }
  }
  
  function closeConnection() {
    if (ws) {
      ws.close();
      ws = null;
    }
    heartReset();
    pendingMessages = [];
    subscriptions = [];
    manuallyClosed = true;
    // console.log('[Worker] WebSocket closed manually');
  }