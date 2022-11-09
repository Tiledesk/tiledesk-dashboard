import { Injectable } from '@angular/core';
import { AppConfigService } from '../../services/app-config.service';
import { LogLevel } from '../../utils/util';
@Injectable()


export class LoggerService {
  // private logLevel: number = LogLevel.Debug
  private logLevel: number;

  // Error = 0,
  // Warn = 1,
  // Info = 2,
  // Debug = 3

  constructor(
    public appConfigService: AppConfigService
  ) {

  }


  initilaizeLoger() {
    // if (environment.remoteConfig) {
    //   console.log("[LoggerService] current HERE REMOTE CONFIG ")
    //  this.appConfigService.loadAppConfig();
    //  const config = this.appConfigService.getConfig();
    //  console.log("[LoggerService] current HERE YES config ", config)
    // }



    const config = this.appConfigService.getConfig();
    // console.log("[LoggerService] current HERE YES config ", config)
    // if (config.loggingLevel === "Info") {
    //   console.log("[LoggerService] loggingLevel:", config.loggingLevel)
    // }
    // && config.logLevel.length > 0
    if (config.logLevel !== undefined) {

      if (typeof this.appConfigService.getConfig().logLevel === 'string') {
        
        if (config.logLevel.length > 0) {
          if (config.logLevel.toUpperCase() === "ERROR") {
            console.info('%c ### DSHBRD [LOGGER-SERV] Log Level: ERROR ', 'color: #1a73e8' );
            this.logLevel = 0
          } else if (config.logLevel.toUpperCase() === "WARN") {
            console.info('%c ### DSHBRD [LOGGER-SERV] Log Level: WARN ', 'color: #1a73e8' );
            this.logLevel = 1
          } else if (config.logLevel.toUpperCase() === "INFO") {
            console.info('%c ### DSHBRD [LOGGER-SERV] Log Level: INFO ', 'color: #1a73e8' );
            this.logLevel = 2
          } else if (config.logLevel.toUpperCase() === "DEBUG") {
            console.info('%c ### DSHBRD [LOGGER-SERV] Log Level: DEBUG ', 'color: #1a73e8' );
            this.logLevel = 3
          } else if (config.logLevel.toUpperCase() !== "ERROR" || config.logLevel.toUpperCase() === "WARN" || config.logLevel.toUpperCase() !== "INFO" || config.logLevel.toUpperCase() !== "DEBUG") {
            console.error('logLevel has no valid value! Will be used the Debug log level. See the tiledesk-dashboard README.md available on https://github.com/Tiledesk/tiledesk-dashboard#dashboard-configjson ')
            this.logLevel = 3 // debug
          }
        } else {
          console.error('logLevel has an empty value! Will be used the Debug log level ')
          this.logLevel = 3 // debug
        }
      } else {
        console.error('logLevel is not a string. Will be used the Debug log level. See the tiledesk-dashboard README.md available on https://github.com/Tiledesk/tiledesk-dashboard#dashboard-configjson')

        this.logLevel = 3 // debug
      }
      // || config.loggingLevel.length === 0
    } else if (config.loggingLevel === undefined) {
      // console.log("[LoggerService] IS UNDEFINED OR EMPTY ")
      console.error('logLevel is undefined! Will be used the Debug log level ')
      this.logLevel = 3 // debug
    }

  }


  error(...message: any[]) {
    if (this.logLevel >= LogLevel.ERROR) {
      console.error(message)
    }
  }

  warn(...message: any[]) {
    if (this.logLevel >= LogLevel.WARN) {
      console.warn(message)
    }
  }

  info(...message: any[]) {
    if (this.logLevel >= LogLevel.INFO) {
      console.info(message)
    }
  }

  debug(...message: any[]) {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.debug(message)
    }
  }

  log(...message: any[]) {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.log(message)
    }
  }

  // debug(...args: any[]) {
  //   if (this.logLevel == this.LEVEL_DEBUG) {
  //     console.debug.apply(console, args)
  //   }
  // }

  // log(...args: any[]) {
  //   if (this.logLevel == this.LEVEL_DEBUG) {
  //     console.log.apply(console, args)
  //   }
  // }

  // info(...args: any[]) {
  //   if (this.logLevel <= this.LEVEL_INFO) {
  //     console.info.apply(console, args)
  //   }
  // }

  // error(...args: any[]) {
  //   // if (this.logLevel <= LEVEL_ERROR) {
  //   console.error.apply(console, args)
  //   // }
  // }


}
