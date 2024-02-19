import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';
import { HomeNewsFeedModalComponent } from './home-news-feed-modal/home-news-feed-modal.component';


@Component({
  selector: 'appdashboard-home-news-feed',
  templateUrl: './home-news-feed.component.html',
  styleUrls: ['./home-news-feed.component.scss']
})
export class HomeNewsFeedComponent implements OnInit, AfterViewInit {
  @ViewChild('scrollableElement') scrollableElement: ElementRef;

  // @Input() showskeleton: any;
  newsFeedList: any;
  displayScrollLeftBtn = false;
  displayScrollRightBtn = true;
  constructor(
    private httpClient: HttpClient,
    private logger: LoggerService,
    public dialog: MatDialog,

  ) { }

  ngOnInit(): void {
    this.getNewsFeed()

    // Add event listener to the scrollable element

  }

  ngOnChanges(changes: SimpleChanges): void {
    // this.logger.log('[HOME-NEWS-FEED] showskeleton', this.showskeleton)
  }



  ngAfterViewInit() {

  }

  getNewsFeed() {

    let url = 'assets/mock-data/newsFeed.json';
    this.httpClient.get(url).subscribe(news => {

      this.logger.log('[HOME-NEWS-FEED] - GET NEWS FEED ', news)
      this.newsFeedList = news;
    }, error => {
      this.logger.error('[HOME-NEWS-FEED] - GET NEWS FEED - ERROR: ', error);
    }, () => {
      this.logger.log('[HOME-NEWS-FEED] - GET NEWS FEED * COMPLETE *')
      setTimeout(() => {
        this.initCarousel()
      }, 2000);

    });
  }

  openNews(url: string, type: string) {
    this.logger.log('[HOME-NEWS-FEED] openNews url ', url, ' type ', type)
    if (type === 'video') {
      this.openVideoInModal(url)
    } else {
      this.openNewsLink(url)
    }
  }

  openNewsLink(url: string) {
    this.logger.log('[HOME-NEWS-FEED] url ', url)
    window.open(url, '_blank');
  }

  openVideoInModal(url: string) {
    const dialogRef = this.dialog.open(HomeNewsFeedModalComponent, {
      data: {
        videoURL: url + '&rel=0&controls=1&showinfo=0',

      },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.logger.log(`Dialog result: ${result}`);
    });
  }

  // @HostListener('window:scroll', ['$event'])
  // onScroll(event) {
  //   // Get the horizontal scroll position of the element
  //   setTimeout(() => {
  //     const scrollLeft = this.scrollableElement.nativeElement.scrollLeft;
  //     console.log('[HOME-NEWS-FEED] Horizontal scroll position: ', scrollLeft);
  //   }, 2500);

  // }

  // https://www.codingnepalweb.com/draggable-card-slider-html-css-javascript/
  initCarousel() {
    const wrapper = <HTMLElement>document.querySelector(".news-wrapper");
    const carousel = <HTMLElement>document.querySelector(".news-feed-carousel");
    this.logger.log('[HOME-NEWS-FEED] carousel.offsetWidth ', carousel.offsetWidth)


    if (carousel) {
      const _firstCardWidth = <HTMLElement>carousel.querySelector(".news-card");
      if (_firstCardWidth) {
        const firstCardWidth = _firstCardWidth.offsetWidth;
        this.logger.log('[HOME-NEWS-FEED] firstCardWidth', firstCardWidth)

        const arrowBtns = document.querySelectorAll(".news-wrapper i");
        const carouselChildrens = [...[carousel.children]];
        // console.log('[HOME-NEWS-FEED] carouselChildrens ', carouselChildrens)
        // console.log('[HOME-NEWS-FEED] arrowBtns ', arrowBtns)

        let isDragging = false;
        let isAutoPlay = false;
        let startX;
        let startScrollLeft;
        let timeoutId;

        // Get the number of cards that can fit in the carousel at once
        let cardPerView = Math.round(carousel.offsetWidth / firstCardWidth);
        this.logger.log('[HOME-NEWS-FEED]  cardPerView', cardPerView)


        // this.scrollableElement.nativeElement.addEventListener('scroll', this.onScroll);
        // console.log('[HOME-NEWS-FEED]  scrollableElement', this.scrollableElement)
        const feedCarouselEl = document.getElementById('feed-carousel');
        // console.log('[HOME-NEWS-FEED]  feedCarouselEl', feedCarouselEl)
        // // console.log('[HOME-NEWS-FEED]  feedCarouselEl Width', feedCarouselEl.clientWidth)
        // console.log('[HOME-NEWS-FEED]  feedCarouselEl scrollWidth', feedCarouselEl.scrollWidth)


        // const feedCarouselWprEl = document.getElementById('feed-carousel-wpr');
        // console.log('[HOME-NEWS-FEED]  feedCarouselWprEl', feedCarouselWprEl)
        // console.log('[HOME-NEWS-FEED]  feedCarouselWprEl Width', feedCarouselWprEl.clientWidth)

        feedCarouselEl.addEventListener('scroll', (event) => {
          this.logger.log('scroll event ', event);
          const scrollPosition = feedCarouselEl.scrollLeft;
          const scrollScrollWidth = feedCarouselEl.scrollWidth
          this.logger.log('scrollPosition ', scrollPosition);
          this.logger.log('scrollScrollWidth ', scrollScrollWidth);
          if (scrollPosition !== 40) {
            this.displayScrollLeftBtn = true
          } else if (scrollPosition === 40) {
            this.displayScrollLeftBtn = false
            this.displayScrollRightBtn = true
          }
          // if (scrollPosition !== 582) {
          //   this.displayScrollRightBtn = true
          // } else if (scrollPosition === 582) {
          //   this.displayScrollRightBtn = false
          // }

        });


        // if (carousel.scrollLeft < 40) {
        //   this.displayScrollLeftBtn = false
        // } else if (carousel.scrollLeft >= 40) {
        //   this.displayScrollLeftBtn = true
        // }


        // Insert copies of the last few cards to beginning of carousel for infinite scrolling
        // carouselChildrens.slice(-cardPerView).reverse().forEach((card: any) => {
        //   this.logger.log('afterbegin card', card )
        //   carousel.insertAdjacentHTML("afterbegin", card.outerHTML);
        //   this.logger.log('afterbegin carousel', carousel )
        // });

        // Insert copies of the first few cards to end of carousel for infinite scrolling
        // carouselChildrens.slice(0, cardPerView).forEach((card: any) => {
        //   this.logger.log('beforeend card', carousel )
        //   carousel.insertAdjacentHTML("beforeend", card.outerHTML);
        //   this.logger.log('beforeend carousel', carousel )

        // });
        // // Scroll the carousel at appropriate postition to hide first few duplicate cards on Firefox
        // carousel.classList.add("no-transition");
        // carousel.scrollLeft = carousel.offsetWidth;
        // carousel.classList.remove("no-transition");


        // Add event listeners for the arrow buttons to scroll the carousel left and right
        arrowBtns.forEach(btn => {
          btn.addEventListener("click", () => {
            carousel.scrollLeft += btn.id == "left" ? -firstCardWidth : firstCardWidth + 55;
            this.logger.log('[HOME-NEWS-FEED] carousel.scrollLeft ', carousel.scrollLeft)



            // if (carousel.scrollLeft < 40) {
            //   this.displayScrollLeftBtn = false
            // } else if (carousel.scrollLeft >= 40) {
            //   this.displayScrollLeftBtn = true
            // }
          });
        });


        const dragStart = (e) => {
          isDragging = true;

          carousel.classList.add("dragging");
          // Records the initial cursor and scroll position of the carousel
          startX = e.pageX;
          this.logger.log('[HOME-NEWS-FEED] isDragging startX', startX)
          startScrollLeft = carousel.scrollLeft;
        }
        const dragging = (e) => {
          if (!isDragging) return; // if isDragging is false return from here
          // Updates the scroll position of the carousel based on the cursor movement
          carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
          this.logger.log('[HOME-NEWS-FEED] isDragging startX', startX)
        }
        const dragStop = () => {
          isDragging = false;
          carousel.classList.remove("dragging");
        }

        const infiniteScroll = () => {
          // If the carousel is at the beginning, scroll to the end
          if (carousel.scrollLeft === 0) {
            carousel.classList.add("no-transition");
            carousel.scrollLeft = carousel.scrollWidth - (2 * carousel.offsetWidth);
            carousel.classList.remove("no-transition");
          }
          // If the carousel is at the end, scroll to the beginning
          else if (Math.ceil(carousel.scrollLeft) === carousel.scrollWidth - carousel.offsetWidth) {
            carousel.classList.add("no-transition");
            carousel.scrollLeft = carousel.offsetWidth;
            carousel.classList.remove("no-transition");
          }
          // Clear existing timeout & start autoplay if mouse is not hovering over carousel
          clearTimeout(timeoutId);
          if (!wrapper.matches(":hover")) autoPlay();
        }


        const autoPlay = () => {
          if (window.innerWidth < 800 || !isAutoPlay) return; // Return if window is smaller than 800 or isAutoPlay is false
          // Autoplay the carousel after every 2500 ms
          timeoutId = setTimeout(() => carousel.scrollLeft += firstCardWidth, 2500);
        }
        autoPlay();

        carousel.addEventListener("mousedown", dragStart);
        carousel.addEventListener("mousemove", dragging);
        document.addEventListener("mouseup", dragStop);
        carousel.addEventListener("scroll", infiniteScroll);
        wrapper.addEventListener("mouseenter", () => clearTimeout(timeoutId));
        wrapper.addEventListener("mouseleave", autoPlay);
      }
    }
  }

}
