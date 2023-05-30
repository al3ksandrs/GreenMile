/**
 * controller to load roadmap and show content
 * also displays news titles of the selected month
 * @author kashif
 */

import {Controller} from "./controller.js";
import {AmbitionRepository} from "../repositories/AmbitionRepository.js";


export class AmbitionController extends Controller {
    #ambitionView;
    #ambitionRepository;

    constructor() {
        super();
        this.#setupView();
        this.#ambitionRepository = new AmbitionRepository();
    }

    async #setupView() {
        this.#ambitionView = await super.loadHtmlIntoContent("html_views/ambition.html");
        this.#roadmap();
        this.#loadTimelineValues();
        this.#findNewsletters();
        this.#findProgress()


    }

    async #loadTimelineValues() {
        const timelineValues = await this.#ambitionRepository.getTimelineValues();
        const timelineContainer = this.#ambitionView.querySelector('.cd-horizontal-timeline');
        const events = timelineContainer.querySelector('.events');
        const eventsContent = timelineContainer.querySelector('.events-content');

        // Select all the parent elements of the placeholders
        const placeholderParents = document.querySelectorAll('.timeline-date');

        // Iterate over each parent element
        placeholderParents.forEach((placeholderParent) => {
            // Select the placeholder elements within the current parent element
            const placeholderElements = placeholderParent.querySelectorAll('li');

            // Remove the placeholder elements from their parent
            placeholderElements.forEach((element) => {
                placeholderParent.removeChild(element);
            });
        });

        // Get the existing ordered list
        const olElement1 = timelineContainer.querySelector('.timeline-date');

        // Create a different ordered list element
        const olElement2 = document.createElement('ol');
        olElement2.classList.add('timeline-ol');

        // Calculate spacing and initial left position
        const spacing = 150;
        let leftPosition = 0;

        timelineValues.forEach((timelineValue, index) => {
            const { date, informatie, titel, maand, jaar } = timelineValue;

            // Format the date string
            const formattedDate = date.split("T")[0];

            // Create a new list item element for the first ordered list
            const listItemElement1 = document.createElement('li');
            const linkElement = document.createElement('a');
            linkElement.setAttribute('data-date', formattedDate);
            linkElement.classList.add('timeline-a', `date${index}`);
            if (index === 0) {
                linkElement.classList.add('selected', 'older-item');
            }
            linkElement.innerText = maand;
            listItemElement1.appendChild(linkElement);

            // Create the second list item element for the second ordered list
            const listItemElement2 = document.createElement('li');
            listItemElement2.setAttribute('data-date', formattedDate);
            listItemElement2.classList.add('timeline-a', `date${index}`);
            listItemElement2.innerHTML = `
      <p class="year${index}">${jaar}</p>
      <h2 class="title${index}">${titel}</h2>
      <p class="info${index}">${informatie}</p>
      <h6 class="timeline-available-news"><br>De nieuwsbrieven die deze maand zijn uitgegeven:</h6>
      <div class="news${index}"></div>
      <h6 class="timeline-progress"><br>Het groen die in deze maand is toegevoegd:</h6>
      <div class="tree-garden${index}"></div>
      <div class="facade-garden${index}"></div>
    `;

            if (index === 0) {
                listItemElement2.classList.add('selected');
            }

            // Set the left position for the <a> element
            linkElement.style.left = `${leftPosition}px`;

            // Increment the left position
            leftPosition += spacing;

            // Append the list items to the respective ordered lists
            olElement1.appendChild(listItemElement1);
            olElement2.appendChild(listItemElement2);
        });

        // Append the second ordered list to the events wrapper
        events.appendChild(olElement1);
        eventsContent.appendChild(olElement2);
    }


    /**
     * This function retrieves the dates of the published newsletters and the selected roadmap date and shows the
     * titles of the newsletters published in the same month if there are any
     * @returns {Promise<void>}
     */
    async #findNewsletters() {
        const newsletters = await this.#ambitionRepository.findNewsletters();
        const timelineValues = await this.#ambitionRepository.getTimelineValues();

        for (const newsletter of newsletters) {
            const valueNewsDate = new Date(newsletter.date);
            const newsYear = valueNewsDate.getFullYear();
            const newsMonth = valueNewsDate.getMonth() + 1;
            const index = timelineValues.findIndex(timelineValue => {
                const timelineDate = new Date(timelineValue.date);
                const timelineYear = timelineDate.getFullYear();
                const timelineMonth = timelineDate.getMonth() + 1;

                return timelineYear === newsYear && timelineMonth === newsMonth;

            });

            if (index !== -1) {
                const newsletterElement = document.querySelector(`.news${index}`);
                newsletterElement.innerHTML += `<div>${newsletter.title}</div>`;
            }
        }
    }

    async #findProgress() {
        const timelineValues = await this.#ambitionRepository.getTimelineValues();
        const progress1 = await this.#ambitionRepository.findProgress();
        const monthlySums = {}; // Object to store the monthly sums

        for (const progress2 of progress1) {
            const valueGardenDate = new Date(progress2.datum);
            const gardenYear = valueGardenDate.getFullYear();
            const gardenMonth = valueGardenDate.getMonth() + 1;
            const index = timelineValues.findIndex(timelineValue => {
                const timelineDate = new Date(timelineValue.date);
                const timelineYear = timelineDate.getFullYear();
                const timelineMonth = timelineDate.getMonth() + 1;
                return timelineYear === gardenYear && timelineMonth === gardenMonth;
            });

            if (index !== -1) {
                const treeGardenElement = document.querySelector(`.tree-garden${index}`);
                const facadeGardenElement = document.querySelector(`.facade-garden${index}`);
                const type = progress2.type_id;

                if (!monthlySums.hasOwnProperty(gardenMonth)) {
                    monthlySums[gardenMonth] = {
                        type1Sum: 0,
                        type2Sum: 0
                    };
                }

                if (type === 1) {
                    monthlySums[gardenMonth].type1Sum += 1;
                } else if (type === 2) {
                    monthlySums[gardenMonth].type2Sum += 1;
                }

                // Displays the tree garden added in this month
                treeGardenElement.innerHTML = `<div class="tree-garden">${monthlySums[gardenMonth].type1Sum +1}</div>`;
                // Displays the facade garden added in this month
                facadeGardenElement.innerHTML = `<div class="facade-garden">${monthlySums[gardenMonth].type2Sum}</div>`;
            }
        }
    }



    #roadmap() {
        let timelines = document.querySelectorAll('.cd-horizontal-timeline');
        let eventsMinDistance = 500;

        if (timelines.length > 0) {
            initTimeline(timelines);
        }


        function initTimeline(timelines) {
            timelines.forEach(function (timeline) {
                let timelineComponents = {};
                timelineComponents['timelineWrapper'] = timeline.querySelector('.events-wrapper');
                timelineComponents['eventsWrapper'] = timelineComponents['timelineWrapper'].querySelector('.events');
                timelineComponents['fillingLine'] = timelineComponents['eventsWrapper'].querySelector('.filling-line');
                timelineComponents['timelineEvents'] = timelineComponents['eventsWrapper'].querySelectorAll('a');
                timelineComponents['timelineDates'] = parseDate(timelineComponents['timelineEvents']);
                timelineComponents['eventsMinLapse'] = minLapse(timelineComponents['timelineDates']);
                timelineComponents['timelineNavigation'] = timeline.querySelector('.cd-timeline-navigation');
                timelineComponents['eventsContent'] = timeline.querySelector('.events-content');

                setDatePosition(timelineComponents, eventsMinDistance);
                let timelineTotWidth = setTimelineWidth(timelineComponents, eventsMinDistance);
                timeline.classList.add('loaded');

                timelineComponents['timelineNavigation'].querySelector('.next').addEventListener('click', function (event) {
                    event.preventDefault();
                    updateSlide(timelineComponents, timelineTotWidth, 'next');
                    showNewContent(timelineComponents, timelineTotWidth, 'next')
                });

                timelineComponents['timelineNavigation'].querySelector('.prev').addEventListener('click', function (event) {
                    event.preventDefault();
                    updateSlide(timelineComponents, timelineTotWidth, 'prev');
                    showNewContent(timelineComponents, timelineTotWidth, 'prev')
                });
            });
        }

        function updateSlide(timelineComponents, timelineTotWidth, string) {
            let wrapperWidth = Number(timelineComponents['timelineWrapper'].style.width.replace('px', ''));

            if (timelineComponents['events'] && timelineComponents['events'].length > 0) {
                let eventCount = timelineComponents['events'].length;
                let eventWidth = wrapperWidth / eventCount;
                // Set the initial value to the width of a single event
                if (string === 'next') {
                    translateTimeline(timelineComponents, -wrapperWidth + eventWidth);
                } else {
                    translateTimeline(timelineComponents, 0, wrapperWidth - timelineTotWidth);
                }
            }
        }

        function showNewContent(timelineComponents, timelineTotWidth, string) {
            let visibleContent = timelineComponents['eventsContent'].querySelector('.selected');
            let newContent = (string === 'next') ? visibleContent.nextElementSibling : visibleContent.previousElementSibling;

            if (newContent !== null) {
                let selectedDate = timelineComponents['eventsWrapper'].querySelector('.selected');
                let newEvent = (string === 'next') ? selectedDate.parentNode.nextElementSibling.querySelector('a') : selectedDate.parentNode.previousElementSibling.querySelector('a');
                updateFilling(newEvent, timelineComponents['fillingLine'], timelineTotWidth);
                updateVisibleContent(newEvent, timelineComponents['eventsContent']);
                newEvent.classList.add('selected');
                selectedDate.classList.remove('selected');
                updateTimelinePosition(string, newEvent, timelineComponents, timelineTotWidth);
            }
        }

        function updateTimelinePosition(string, event, timelineComponents, timelineTotWidth) {
            // Translate timeline to the left/right according to the position of the selected event
            let eventStyle = getComputedStyle(event, null);
            let eventLeft = Number(eventStyle.getPropertyValue("left").replace('px', ''));
            let timelineWidth = Number(getComputedStyle(timelineComponents['timelineWrapper'], null).getPropertyValue('width').replace('px', ''));
            let timelineTranslate = getTranslateValue(timelineComponents['eventsWrapper']);

            // Calculate the maximum timeline translation distance
            let maxTimelineTranslate = timelineTotWidth - timelineWidth;

            // Stop translation if the timeline has reached the end
            if ((string === 'next' && timelineTranslate <= -maxTimelineTranslate) || (string === 'prev' && timelineTranslate >= 0)) {
                return;
            }

            if ((string === 'next' && eventLeft > timelineWidth - timelineTranslate) || (string === 'prev' && eventLeft < -timelineTranslate)) {
                translateTimeline(timelineComponents, -eventLeft + timelineWidth/3);
            }
        }

        function translateTimeline(timelineComponents, value,) {
            let eventsWrapper = timelineComponents['eventsWrapper'];
            value = (value > 0) ? 0 : value; // Only negative translate value
            eventsWrapper.style.transform = 'translateX(' + value + 'px)';

        }

        function updateFilling(selectedEvent, filling, totWidth) {
            // Change .filling-line length according to the selected event
            let eventStyle = getComputedStyle(selectedEvent, null);
            let eventLeft = Number(eventStyle.getPropertyValue('left').replace('px', ''));
            let eventWidth = Number(eventStyle.getPropertyValue('width').replace('px', ''));
            let eventCenter = eventLeft + eventWidth / 2;

            //makes sure the line does not disappear after the last date has been shown
            if (selectedEvent.classList.contains('last-date')) {
                filling.style.transform = 'scaleX(2)';
            } else {
                let scaleValue = eventCenter / totWidth;
                filling.style.transform = 'scaleX(' + scaleValue + ')';
            }
        }

        function setDatePosition(timelineComponents, min) {
            const timelineDates = timelineComponents['timelineDates'];
            const timelineEvents = timelineComponents['timelineEvents'];
            const totalEvents = timelineDates.length;
            const totalWidth = (totalEvents - 1) * min;
            const containerWidth = timelineComponents['timelineWrapper'].offsetWidth;

            const spacing = (containerWidth - totalWidth) / (totalEvents + 150);

            timelineEvents.forEach(function (event, index) {
                const leftPosition = index * (min + spacing);
                event.style.left = leftPosition + 'px';
            });
        }

        function setTimelineWidth(timelineComponents, width) {
            let timelineDates = timelineComponents['timelineDates'];
            let eventsMinLapse = timelineComponents['eventsMinLapse'];
            let eventsWrapper = timelineComponents['eventsWrapper'];
            let fillingLine = timelineComponents['fillingLine'];
            let timelineEvents = timelineComponents['timelineEvents'];

            let timeSpan = daydiff(timelineDates[0], timelineDates[timelineDates.length - 1]);
            let timeSpanNorm = Math.round(timeSpan / eventsMinLapse) + 4;
            let totalWidth = timeSpanNorm * width;

            eventsWrapper.style.width = totalWidth + 'px';
            updateFilling(timelineEvents[0], fillingLine, totalWidth);

            return totalWidth;
        }

        function updateVisibleContent(event, eventsContent) {
            let eventDate = event.dataset.date,
                visibleContent = eventsContent.querySelector('.selected'),
                selectedContent = eventsContent.querySelector('[data-date="' + eventDate + '"]'),
                selectedContentHeight = selectedContent.offsetHeight;

            let classEntering;
            let classLeaving;

                if (selectedContent.index > visibleContent.index) {
                    classEntering = 'selected enter-right';
                    classLeaving = 'leave-left';
                } else {
                    classEntering = 'selected enter-left';
                    classLeaving = 'leave-right';
                }

            selectedContent.className = classEntering;
            visibleContent.className = classLeaving;
            visibleContent.addEventListener('animationend', function () {
                visibleContent.classList.remove('leave-right', 'leave-left');
                selectedContent.classList.remove('enter-left', 'enter-right');
            });

            eventsContent.style.height = selectedContentHeight + 'px';
        }

        function getTranslateValue(timeline) {
            let timelineStyle = window.getComputedStyle(timeline, null);
            let timelineTranslate = timelineStyle.getPropertyValue('-webkit-transform') ||
                timelineStyle.getPropertyValue('-moz-transform') ||
                timelineStyle.getPropertyValue('-ms-transform') ||
                timelineStyle.getPropertyValue('-o-transform') ||
                timelineStyle.getPropertyValue('transform');

            let translateValue = 0;

            if (timelineTranslate.indexOf('(') >= 0) {
                timelineTranslate = timelineTranslate.split('(')[1];
                timelineTranslate = timelineTranslate.split(')')[0];
                timelineTranslate = timelineTranslate.split(',');
                translateValue = Number(timelineTranslate[4]);
            }

            return translateValue;
        }

        function parseDate(events) {
            let dateArrays = [];
            events.forEach(function (event) {
                let dateComp = event.dataset.date.split('-');
                let newDate = new Date(dateComp[2], dateComp[1] - 1, dateComp[0]);
                dateArrays.push(newDate);
            });
            return dateArrays;
        }


        function daydiff(first, second) {
            return Math.round((second - first));
        }

        function minLapse(dates) {
            let dateDistances = [];
            for (let i = 1; i < dates.length; i++) {
                let distance = daydiff(dates[i - 1], dates[i]);
                dateDistances.push(distance);
            }
            return Math.min.apply(null, dateDistances);
        }

    }
}