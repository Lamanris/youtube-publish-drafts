(() => {
    // -----------------------------------------------------------------
    // CONFIG (you're safe to edit this)
    // -----------------------------------------------------------------
    // ~ GLOBAL CONFIG
    // -----------------------------------------------------------------
    const MODE = 'publish_drafts'; // 'publish_drafts' / 'sort_playlist';
    const DEBUG_MODE = true; // true / false, enable for more context
    // -----------------------------------------------------------------
    // ~ PUBLISH CONFIG
    // -----------------------------------------------------------------
    const MADE_FOR_KIDS = false; // true / false;
    const VISIBILITY = 'Public'; // 'Public' / 'Private' / 'Unlisted'

    // ADDITIONAL CONFIG
    const YOUTUBE_LANGUAGE = 'RU'; // RU / ENG
    const PLAN_PUBLISH = true; // true / false
    const PLAN_DATE_RANGE = {
        startDate: {
            day: 20,        // It's better to set plan date to next day after today (example: today is 19, better to set 20)
            month: 1,        // Or if you want make it today, make sure to put correct time range or will be errors
            year: 2023
        },                   // Change values to exist values
        endDate: {           // If random generated date would be beyond youtube limitations, the plan date would be set by default
            day: 22,
            month: 3,
            year: 2024       // 2 YEARS maximum limit in YOUTUBE
        }
    };
    const PLAN_TIME_RANGE = {
        startTime: {
            hour: 15,     // 0, 1, 2, 3..., 23
            minutes: 15   // 0, 15, 30, 45
        },
        endTime: {
            hour: 18,
            minutes: 31
        }
    };
    const PLAN_TIMEZONE = '(GMT-08:00) Анкоридж';


    // -----------------------------------------------------------------
    // ~ SORT PLAYLIST CONFIG
    // -----------------------------------------------------------------
    const SORTING_KEY = (one, other) => {
        const numberRegex = /\d+/;
        const number = (name) => name.match(numberRegex)[0];
        if (number(one.name) === undefined || number(other.name) === undefined) {
            return one.name.localeCompare(other.name);
        }
        return number(one.name) - number(other.name);
    };
    // END OF CONFIG (not safe to edit stuff below)
    // -----------------------------------------------------------------

    // Art by Joan G. Stark
    // .'"'.        ___,,,___        .'``.
    // : (\  `."'"```         ```"'"-'  /) ;
    //  :  \                         `./  .'
    //   `.                            :.'
    //     /        _         _        \
    //    |         0}       {0         |
    //    |         /         \         |
    //    |        /           \        |
    //    |       /             \       |
    //     \     |      .-.      |     /
    //      `.   | . . /   \ . . |   .'
    //        `-._\.'.(     ).'./_.-'
    //            `\'  `._.'  '/'
    //              `. --'-- .'
    //                `-...-'



    // ----------------------------------
    // COMMON  STUFF
    // ---------------------------------
    const TIMEOUT_STEP_MS = 20;
    const DEFAULT_ELEMENT_TIMEOUT_MS = 10000;
    function debugLog(...args) {
        if (!DEBUG_MODE) {
            return;
        }
        console.debug(...args);
    }
    const sleep = (ms) => new Promise((resolve, _) => setTimeout(resolve, ms));

    async function waitForElement(selector, baseEl, timeoutMs) {
        if (timeoutMs === undefined) {
            timeoutMs = DEFAULT_ELEMENT_TIMEOUT_MS;
        }
        if (baseEl === undefined) {
            baseEl = document;
        }
        let timeout = timeoutMs;
        while (timeout > 0) {
            let element = baseEl.querySelector(selector);
            if (element !== null) {
                return element;
            }
            await sleep(TIMEOUT_STEP_MS);
            timeout -= TIMEOUT_STEP_MS;
        }
        debugLog(`could not find ${selector} inside`, baseEl);
        return null;
    }

    function click(element) {
        const event = document.createEvent('MouseEvents');
        event.initMouseEvent('mousedown', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        element.dispatchEvent(event);
        element.click();
        debugLog(element, 'clicked');
    }

    // ----------------------------------
    // PUBLISH STUFF
    // ----------------------------------
    const VISIBILITY_PUBLISH_ORDER = {
        'Private': 0,
        'Unlisted': 1,
        'Public': 2,
    };

    // SELECTORS
    // ---------
    const VIDEO_ROW_SELECTOR = 'ytcp-video-row';
    const DRAFT_MODAL_SELECTOR = '.style-scope.ytcp-uploads-dialog';
    const DRAFT_BUTTON_SELECTOR = '.edit-draft-button';
    const MADE_FOR_KIDS_SELECTOR = '#made-for-kids-group';
    const RADIO_BUTTON_SELECTOR = 'tp-yt-paper-radio-button';
    const VISIBILITY_STEPPER_SELECTOR = '#step-badge-3';
    const VISIBILITY_PAPER_BUTTONS_SELECTOR = 'tp-yt-paper-radio-group';
    const SAVE_BUTTON_SELECTOR = '#done-button';
    const SUCCESS_ELEMENT_SELECTOR = 'ytcp-video-thumbnail-with-info';
    const DIALOG_SELECTOR = 'ytcp-dialog.ytcp-video-share-dialog > tp-yt-paper-dialog:nth-child(1)';
    const DIALOG_CLOSE_BUTTON_SELECTOR = 'tp-yt-iron-icon';

    const PLAN_PUBLISH_BUTTON = 'tp-yt-paper-radio-button[name="SCHEDULE"]';
    const PLAN_TIMEZONE_BUTTON = '#timezone-select-button';
    const PLAN_DATEPICKER_BUTTON = '#datepicker-trigger';
    const PLAN_TIME_BUTTON = '#time-of-day-container input';


    class SuccessDialog {
        constructor(raw) {
            this.raw = raw;
        }

        async closeDialogButton() {
            return await waitForElement(DIALOG_CLOSE_BUTTON_SELECTOR, this.raw);
        }

        async close() {
            click(await this.closeDialogButton());
            await sleep(50);
            debugLog('closed');
        }
    }

    class VisibilityModal {
        constructor(raw) {
            this.raw = raw;
        }

        async radioButtonGroup() {
            return await waitForElement(VISIBILITY_PAPER_BUTTONS_SELECTOR, this.raw);
        }

        async visibilityRadioButton() {
            const group = await this.radioButtonGroup();
            const value = VISIBILITY_PUBLISH_ORDER[VISIBILITY];
            return [...group.querySelectorAll(RADIO_BUTTON_SELECTOR)][value];
        }

        async setVisibility() {
            click(await this.visibilityRadioButton());
            debugLog(`visibility set to ${VISIBILITY}`);
            await sleep(50);
        }

        async planPublishPaperButton() {
            return await waitForElement(`${PLAN_PUBLISH_BUTTON}`, this.raw);
        }
        async selectPlanPublish() {
            click(await this.planPublishPaperButton());
            await sleep(50);
            debugLog("Plan Publish selected");
        }

        async planTimezoneButton() {
            return await waitForElement(`${PLAN_TIMEZONE_BUTTON}`, this.raw);
        }
        async selectPlanTimezone() {
            click(await this.planTimezoneButton());
            await sleep(50);
            debugLog("Plan Timezone Btn selected");
            const allTimezoneOptions = await document.querySelectorAll('ytcp-text-menu tp-yt-paper-dialog[id="dialog"] yt-formatted-string');
            const filteredTimezones = Array.from(allTimezoneOptions).filter(el => el.innerText === PLAN_TIMEZONE);
            if (filteredTimezones.length > 0) {
                click(filteredTimezones[0]);
            } else {
                click(document.querySelector('tp-yt-iron-overlay-backdrop'));
                debugLog('Timezone not found in youtube supported timezones')
            }
        }

        async planDatePickerButton() {
            return await waitForElement(`${PLAN_DATEPICKER_BUTTON}`, this.raw);
        }
        async selectPlanDatePicker() {
            click(await this.planDatePickerButton());
            await sleep(50);
            debugLog("Plan Datepicker Btn selected");
            function formatDate(date) {
                let monthsNamesRu = ['ЯНВ.', 'ФЕВР.', 'МАР.', 'АПР.', 'МАЯ', 'ИЮН.', 'ИЮЛ.', 'АВГ.', 'СЕНТ.', 'ОКТ.', 'НОЯБ.', 'ДЕК.'];
                let monthsNamesEng = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                if (YOUTUBE_LANGUAGE === 'ENG') {
                    return `${monthsNamesEng[date.getMonth()]} ${date.getFullYear()}`
                } else {
                    return `${monthsNamesRu[date.getMonth()]} ${date.getFullYear()}`
                }
            }
            function randomDate(start, end) { return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())) }
            const RANDOM_GENERATED_DATE = randomDate(new Date(PLAN_DATE_RANGE.startDate.year, PLAN_DATE_RANGE.startDate.month - 1, PLAN_DATE_RANGE.startDate.day), new Date(PLAN_DATE_RANGE.endDate.year, PLAN_DATE_RANGE.endDate.month - 1, PLAN_DATE_RANGE.endDate.day));
            let newFormattedDate = formatDate(RANDOM_GENERATED_DATE);
            debugLog(`Random Date: ${RANDOM_GENERATED_DATE.getDate()} ${newFormattedDate}`);

            async function scrollItems(){
                const dateItemsMonths = document.querySelectorAll('ytcp-date-picker #calendar-main .calendar-month-label');
                const filtered = Array.from(dateItemsMonths).filter(el => el.innerText === newFormattedDate);
                if (document.querySelector('ytcp-date-picker #calendar-main').scrollTop < 4700) {
                    if (filtered.length > 0) {
                        let parent = filtered[0].parentElement;
                        let monthDays = parent.querySelectorAll('.calendar-day');
                        let monthFilteredDays = Array.from(monthDays).filter(el => +el.innerText === RANDOM_GENERATED_DATE.getDate());
                        click(monthFilteredDays[0]);
                    } else {
                        document.querySelector('ytcp-date-picker #calendar-main').scrollBy(0,200);
                        await sleep(100);
                        await scrollItems()
                    }
                } else {
                    click(document.querySelector('tp-yt-iron-overlay-backdrop'));
                    debugLog('Random date not found in youtube supported dates');
                }
            }
            await scrollItems();
        }

        async planTimeButton() {
            return await waitForElement(`${PLAN_TIME_BUTTON}`, this.raw);
        }
        async selectPlanTime() {
            click(await this.planTimeButton());
            await sleep(50);
            debugLog("Plan Time Btn selected");

            function padTo2Digits(num) {
                return num.toString().padStart(2, '0');
            }
            var startTime = `2022-08-10 ${padTo2Digits(PLAN_TIME_RANGE.startTime.hour)}:${padTo2Digits(PLAN_TIME_RANGE.startTime.minutes)}:00`;
            var endTime = `2022-08-10 ${padTo2Digits(PLAN_TIME_RANGE.endTime.hour)}:${padTo2Digits(PLAN_TIME_RANGE.endTime.minutes)}:00`;
            var parseIn = function(date_time){
                var d = new Date();
                d.setHours(date_time.substring(11,13));
                d.setMinutes(date_time.substring(14,16));

                return d;
            };
            var getTimeIntervals = function (time1, time2) {
                var arr = [];
                while(time1 < time2){
                    arr.push(time1.toTimeString().substring(0,5));
                    time1.setMinutes(time1.getMinutes() + 15);
                }
                return arr;
            };
            startTime = parseIn(startTime);
            endTime = parseIn(endTime);
            var intervals = getTimeIntervals(startTime, endTime);
            const filteringKey = intervals[Math.floor(Math.random() * intervals.length)];

            debugLog('Random Time:', filteringKey);

            const timeListItems = document.querySelectorAll('ytcp-time-of-day-picker tp-yt-paper-item');
            const filteredTimeItems = Array.from(timeListItems).filter(el => el.innerText === filteringKey);
            if (filteredTimeItems.length > 0) {
                click(filteredTimeItems[0]);
            } else {
                click(document.querySelector('tp-yt-iron-overlay-backdrop'));
                debugLog('Time not found in youtube supported time')
            }
        }

        async planPublish() {
            await this.selectPlanPublish();
            await this.selectPlanDatePicker();
            await this.selectPlanTimezone();
            await this.selectPlanTime();
        }

        async saveButton() {
            return await waitForElement(SAVE_BUTTON_SELECTOR, this.raw);
        }
        async isSaved() {
            await waitForElement(SUCCESS_ELEMENT_SELECTOR, document);
        }
        async dialog() {
            return await waitForElement(DIALOG_SELECTOR);
        }
        async save() {
            click(await this.saveButton());
            await this.isSaved();
            debugLog('saved');
            const dialogElement = await this.dialog();
            const success = new SuccessDialog(dialogElement);
            return success;
        }
    }

    class DraftModal {
        constructor(raw) {
            this.raw = raw;
        }

        async madeForKidsToggle() {
            return await waitForElement(MADE_FOR_KIDS_SELECTOR, this.raw);
        }

        async madeForKidsPaperButton() {
            const nthChild = MADE_FOR_KIDS ? 1 : 2;
            return await waitForElement(`${RADIO_BUTTON_SELECTOR}:nth-child(${nthChild})`, this.raw);
        }

        async selectMadeForKids() {
            click(await this.madeForKidsPaperButton());
            await sleep(50);
            debugLog(`"Made for kids" set as ${MADE_FOR_KIDS}`);
        }

        async visibilityStepper() {
            return await waitForElement(VISIBILITY_STEPPER_SELECTOR, this.raw);
        }

        async goToVisibility() {
            debugLog('going to Visibility');
            await sleep(50);
            click(await this.visibilityStepper());
            const visibility = new VisibilityModal(this.raw);
            await sleep(50);
            await waitForElement(VISIBILITY_PAPER_BUTTONS_SELECTOR, visibility.raw);
            return visibility;
        }
    }

    class VideoRow {
        constructor(raw) {
            this.raw = raw;
        }

        get editDraftButton() {
            return waitForElement(DRAFT_BUTTON_SELECTOR, this.raw, 20);
        }

        async openDraft() {
            debugLog('focusing draft button');
            click(await this.editDraftButton);
            return new DraftModal(await waitForElement(DRAFT_MODAL_SELECTOR));
        }
    }


    function allVideos() {
        return [...document.querySelectorAll(VIDEO_ROW_SELECTOR)].map((el) => new VideoRow(el));
    }

    async function editableVideos() {
        let editable = [];
        for (let video of allVideos()) {
            if ((await video.editDraftButton) !== null) {
                editable = [...editable, video];
            }
        }
        return editable;
    }

    async function publishDrafts() {
        const videos = await editableVideos();
        debugLog(`found ${videos.length} videos`);
        debugLog('starting in 1000ms');
        await sleep(1000);
        for (let video of videos) {
            const draft = await video.openDraft();
            debugLog({
                draft
            });
            await draft.selectMadeForKids();
            const visibility = await draft.goToVisibility();
            await visibility.setVisibility();

            if (PLAN_PUBLISH) {
                await visibility.planPublish();
            }

            const dialog = await visibility.save();
            await dialog.close();
            await sleep(100);
        }
    }

    // ----------------------------------
    // SORTING STUFF
    // ----------------------------------
    const SORTING_MENU_BUTTON_SELECTOR = 'button';
    const SORTING_ITEM_MENU_SELECTOR = 'paper-listbox#items';
    const SORTING_ITEM_MENU_ITEM_SELECTOR = 'ytd-menu-service-item-renderer';
    const MOVE_TO_TOP_INDEX = 4;
    const MOVE_TO_BOTTOM_INDEX = 5;

    class SortingDialog {
        constructor(raw) {
            this.raw = raw;
        }

        async anyMenuItem() {
            const item =  await waitForElement(SORTING_ITEM_MENU_ITEM_SELECTOR, this.raw);
            if (item === null) {
                throw new Error("could not locate any menu item");
            }
            return item;
        }

        menuItems() {
            return [...this.raw.querySelectorAll(SORTING_ITEM_MENU_ITEM_SELECTOR)];
        }

        async moveToTop() {
            click(this.menuItems()[MOVE_TO_TOP_INDEX]);
        }

        async moveToBottom() {
            click(this.menuItems()[MOVE_TO_BOTTOM_INDEX]);
        }
    }
    class PlaylistVideo {
        constructor(raw) {
            this.raw = raw;
        }
        get name() {
            return this.raw.querySelector('#video-title').textContent;
        }
        async dialog() {
            return this.raw.querySelector(SORTING_MENU_BUTTON_SELECTOR);
        }

        async openDialog() {
            click(await this.dialog());
            const dialog = new SortingDialog(await waitForElement(SORTING_ITEM_MENU_SELECTOR));
            await dialog.anyMenuItem();
            return dialog;
        }

    }
    async function playlistVideos() {
        return [...document.querySelectorAll('ytd-playlist-video-renderer')]
            .map((el) => new PlaylistVideo(el));
    }
    async function sortPlaylist() {
        debugLog('sorting playlist');
        const videos = await playlistVideos();
        debugLog(`found ${videos.length} videos`);
        videos.sort(SORTING_KEY);
        const videoNames = videos.map((v) => v.name);

        let index = 1;
        for (let name of videoNames) {
            debugLog({index, name});
            const video = videos.find((v) => v.name === name);
            const dialog = await video.openDialog();
            await dialog.moveToBottom();
            await sleep(1000);
            index += 1;
        }

    }


    // ----------------------------------
    // ENTRY POINT
    // ----------------------------------
    ({
        'publish_drafts': publishDrafts,
        'sort_playlist': sortPlaylist,
    })[MODE]();


})();