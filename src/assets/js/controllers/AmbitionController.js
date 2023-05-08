import {Controller} from "./controller.js";
import {AmbitionRepository} from "../repositories/AmbitionRepository.js";


export class AmbitionController extends Controller {
    #ambitionView;
    #ambitionRepository;
    #timelineDate0;
    #timelineDate1;
    #timelineDate2;
    #timelineDate3;
    #timelineDate4;
    #timelineDate5;
    #timelineDate6;
    #timelineDate7;
    #timelineDate8;

    #timelineInfo0;
    #timelineInfo1;
    #timelineInfo2;
    #timelineInfo3;
    #timelineInfo4;
    #timelineInfo5;
    #timelineInfo6;
    #timelineInfo7;
    #timelineInfo8;


    constructor() {
        super();
        this.#setupView();
        this.#ambitionRepository = new AmbitionRepository();
    }

    async #setupView() {
        this.#ambitionView = await super.loadHtmlIntoContent("html_views/ambition.html");
        this.#roadmap();
        this.#loadTimelineValues();

        this.#timelineDate0 = this.#ambitionView.querySelector(".date0")
        this.#timelineDate1 = this.#ambitionView.querySelector(".date1")
        this.#timelineDate2 = this.#ambitionView.querySelector(".date2")
        this.#timelineDate3 = this.#ambitionView.querySelector(".date3")
        this.#timelineDate4 = this.#ambitionView.querySelector(".date4")
        this.#timelineDate5 = this.#ambitionView.querySelector(".date5")
        this.#timelineDate6 = this.#ambitionView.querySelector(".date6")
        this.#timelineDate7 = this.#ambitionView.querySelector(".date7")
        this.#timelineDate8 = this.#ambitionView.querySelector(".date8")

        this.#timelineInfo0 = this.#ambitionView.querySelector(".info0")
        this.#timelineInfo1 = this.#ambitionView.querySelector(".info1")
        this.#timelineInfo2 = this.#ambitionView.querySelector(".info2")
        this.#timelineInfo3 = this.#ambitionView.querySelector(".info3")
        this.#timelineInfo4 = this.#ambitionView.querySelector(".info4")
        this.#timelineInfo5 = this.#ambitionView.querySelector(".info5")
        this.#timelineInfo6 = this.#ambitionView.querySelector(".info6")
        this.#timelineInfo7 = this.#ambitionView.querySelector(".info7")
        this.#timelineInfo8 = this.#ambitionView.querySelector(".info8")


    }

    async #loadTimelineValues() {
        const timelineValues = await this.#ambitionRepository.getTimelineValues();
        this.#timelineDate0.innerHTML = timelineValues[0].jaar + " " + timelineValues[0].maand;
        this.#timelineDate1.innerHTML = timelineValues[1].jaar + " " + timelineValues[1].maand;
        this.#timelineDate2.innerHTML = timelineValues[2].jaar + " " + timelineValues[2].maand;
        this.#timelineDate3.innerHTML = timelineValues[3].jaar + " "+ timelineValues[3].maand;
        this.#timelineDate4.innerHTML = timelineValues[4].jaar + " "+ timelineValues[4].maand;
        this.#timelineDate5.innerHTML = timelineValues[5].jaar + " "+ timelineValues[5].maand;
        this.#timelineDate6.innerHTML = timelineValues[6].jaar + " "+ timelineValues[6].maand;
        this.#timelineDate7.innerHTML = timelineValues[7].jaar + " "+ timelineValues[7].maand;
        this.#timelineDate8.innerHTML = timelineValues[8].jaar + " "+ timelineValues[8].maand;

        this.#timelineInfo0.innerHTML = timelineValues[0].informatie;
        this.#timelineInfo1.innerHTML = timelineValues[1].informatie;
        this.#timelineInfo2.innerHTML = timelineValues[2].informatie;
        this.#timelineInfo3.innerHTML = timelineValues[3].informatie;
        this.#timelineInfo4.innerHTML = timelineValues[4].informatie;
        this.#timelineInfo5.innerHTML = timelineValues[5].informatie;
        this.#timelineInfo6.innerHTML = timelineValues[6].informatie;
        this.#timelineInfo7.innerHTML = timelineValues[7].informatie;
        this.#timelineInfo8.innerHTML = timelineValues[8].informatie;

    }


    #roadmap() {
        let timelines = document.querySelectorAll('.cd-horizontal-timeline');
        let eventsMinDistance = 100;

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

                timelineComponents['eventsWrapper'].addEventListener('click', function (event) {
                    event.preventDefault();
                    if (event.target.tagName.toLowerCase() === 'a') {
                        timelineComponents['timelineEvents'].forEach(function (eventElement) {
                            eventElement.classList.remove('selected');
                        });
                        event.target.classList.add('selected');
                        updateOlderEvents(event.target);
                        updateFilling(event.target, timelineComponents['fillingLine'], timelineTotWidth);
                        updateVisibleContent(event.target, timelineComponents['eventsContent']);
                    }

                });
            });
        }

        function updateSlide(timelineComponents, timelineTotWidth, string) {
            let translateValue = getTranslateValue(timelineComponents['eventsWrapper']);
            let wrapperWidth = Number(timelineComponents['timelineWrapper'].style.width.replace('px', ''));
            if (string === 'next') {
                translateTimeline(timelineComponents, translateValue + wrapperWidth - eventsMinDistance, wrapperWidth - timelineTotWidth);

            } else {
                translateTimeline(timelineComponents, translateValue - wrapperWidth + eventsMinDistance, wrapperWidth - timelineTotWidth);
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
                updateOlderEvents(newEvent);
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
                translateTimeline(timelineComponents, -eventLeft + timelineWidth / 2, maxTimelineTranslate);
            }
        }

        function translateTimeline(timelineComponents, value, totWidth) {
            let eventsWrapper = timelineComponents['eventsWrapper'];
            value = (value > 0) ? 0 : value; // Only negative translate value
            eventsWrapper.style.transform = 'translateX(' + value + 'px)';
            value = (!(typeof totWidth === 'undefined') && value < totWidth) ? totWidth : value; // Do not translate more than timeline width
            totWidth = -5400;
            // Update navigation arrows visibility
            let prevButton = timelineComponents['timelineNavigation'].querySelector('.prev');
            let nextButton = timelineComponents['timelineNavigation'].querySelector('.next');

            if (value === 0) {
                prevButton.classList.add('inactive');
            } else {
                prevButton.classList.remove('inactive');
            }

            if (value === totWidth) {
                nextButton.classList.add('inactive');
            } else {
                nextButton.classList.remove('inactive');
            }
            console.log("totalWidth is " + totWidth)
            console.log("value is " + value)
        }

        function updateFilling(selectedEvent, filling, totWidth) {
            // Change .filling-line length according to the selected event
            let eventStyle = getComputedStyle(selectedEvent, null);
            let eventLeft = Number(eventStyle.getPropertyValue('left').replace('px', ''));
            let eventWidth = Number(eventStyle.getPropertyValue('width').replace('px', ''));
            let eventCenter = eventLeft + eventWidth / 2;

            if (selectedEvent.classList.contains('last-date')) {
                filling.style.transform = 'scaleX(2)';
            } else {
                let scaleValue = eventCenter / totWidth;
                filling.style.transform = 'scaleX(' + scaleValue + ')';
            }
        }

        function setDatePosition(timelineComponents, min) {
            let timelineDates = timelineComponents['timelineDates'];
            let timelineEvents = timelineComponents['timelineEvents'];

            for (let i = 0; i < timelineDates.length; i++) {
                let distance = daydiff(timelineDates[0], timelineDates[i]);
                let distanceNorm = Math.round(distance / timelineComponents['eventsMinLapse']) + 2;
                timelineEvents[i].style.left = distanceNorm * min + 'px';
            }
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

            let classEntering, classLeaving;

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

        function updateOlderEvents(event) {
            let eventParent = event.parentNode;
            let prevSiblings = [];
            let nextSiblings = [];
            let sibling = eventParent.previousElementSibling;
            while (sibling) {
                prevSiblings.push(sibling.querySelector('a'));
                sibling = sibling.previousElementSibling;
            }
            sibling = eventParent.nextElementSibling;
            while (sibling) {
                nextSiblings.push(sibling.querySelector('a'));
                sibling = sibling.nextElementSibling;
            }

            prevSiblings.forEach(function (elem) {
                elem.classList.add('older-event');
            });

            nextSiblings.forEach(function (elem) {
                elem.classList.remove('older-event');
            });
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
                let dateComp = event.dataset.date.split('/');
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