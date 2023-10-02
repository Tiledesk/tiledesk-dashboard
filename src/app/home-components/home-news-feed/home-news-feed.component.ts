import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-home-news-feed',
  templateUrl: './home-news-feed.component.html',
  styleUrls: ['./home-news-feed.component.scss']
})
export class HomeNewsFeedComponent implements OnInit, AfterViewInit {
  newsFeedList: any;
  displayScrollLeftBtn = false
  constructor(
    private httpClient: HttpClient,
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
    this.getNewsFeed()
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
      }, 1500);

    });
  }


  openNewsLink(url: string) {
    this.logger.log('[HOME-NEWS-FEED] url ', url)
    window.open(url, '_blank');
  }

  // https://www.codingnepalweb.com/draggable-card-slider-html-css-javascript/
  initCarousel() {
    const wrapper = <HTMLElement>document.querySelector(".news-wrapper");
    const carousel = <HTMLElement>document.querySelector(".carousel");
    if (carousel) {
      const _firstCardWidth = <HTMLElement>carousel.querySelector(".news-card");
      const firstCardWidth = _firstCardWidth.offsetWidth;
      const arrowBtns = document.querySelectorAll(".wrapper i");
      const carouselChildrens = [...[carousel.children]];


      let isDragging = false;
      let isAutoPlay = false;
      let startX;
      let startScrollLeft;
      let timeoutId;

      // Get the number of cards that can fit in the carousel at once
      let cardPerView = Math.round(carousel.offsetWidth / firstCardWidth);
      this.logger.log('cardPerView', cardPerView)

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
          carousel.scrollLeft += btn.id == "left" ? -firstCardWidth : firstCardWidth;
          this.logger.log('[HOME-NEWS-FEED] carousel.scrollLeft ', carousel.scrollLeft)



          if (carousel.scrollLeft < 40) {
            this.displayScrollLeftBtn = false
          } else if (carousel.scrollLeft >= 40) {
            this.displayScrollLeftBtn = true
          }
        });
      });

      const dragStart = (e) => {
        isDragging = true;
        carousel.classList.add("dragging");
        // Records the initial cursor and scroll position of the carousel
        startX = e.pageX;
        startScrollLeft = carousel.scrollLeft;
      }
      const dragging = (e) => {
        if (!isDragging) return; // if isDragging is false return from here
        // Updates the scroll position of the carousel based on the cursor movement
        carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
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
