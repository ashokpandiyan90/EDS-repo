/**
 * Table Component – Client-side JavaScript
 *
 * Responsibilities:
 *  1. Locate all table-component instances on the page.
 *  2. Apply the correct variation class derived from the data-variation attribute.
 *  3. For icon-variation tables: wrap the first column content in a semantic
 *     <figure> so icons are accessible and consistently styled.
 *  4. Make tables keyboard-navigable (arrow-key cell movement).
 *  5. Expose a simple public API via window.MySite.Table for testing/extension.
 */
(function (document, window) {
    'use strict';

    /* ------------------------------------------------------------------ */
    /*  Constants                                                           */
    /* ------------------------------------------------------------------ */
    var SELECTOR_COMPONENT   = '.table-component';
    var SELECTOR_ICON_WRAP   = '.table-wrapper--icon .rte-table-content--icon';
    var ATTR_VARIATION       = 'data-variation';
    var CLASS_ICON           = 'table--icon';
    var CLASS_STANDARD       = 'table--standard';

    /* ------------------------------------------------------------------ */
    /*  Utility helpers                                                     */
    /* ------------------------------------------------------------------ */

    /**
     * NodeList/HTMLCollection → Array shim.
     * @param {NodeList} nl
     * @returns {Array}
     */
    function toArray(nl) {
        return Array.prototype.slice.call(nl);
    }

    /**
     * Query all matching elements within an optional root.
     * @param {string}      selector
     * @param {Element}     [root=document]
     * @returns {Element[]}
     */
    function qsa(selector, root) {
        return toArray((root || document).querySelectorAll(selector));
    }

    /* ------------------------------------------------------------------ */
    /*  Icon-variation enhancements                                         */
    /* ------------------------------------------------------------------ */

    /**
     * Wrap bare <img> or <svg> in an icon cell with a <figure> element
     * for semantic markup and consistent styling.
     *
     * @param {Element} tableWrapper - the .table-wrapper--icon element
     */
    function enhanceIconColumn(tableWrapper) {
        var cells = qsa('td:first-child, th:first-child', tableWrapper);
        cells.forEach(function (cell) {
            var img = cell.querySelector('img, svg');
            if (!img) { return; }

            // Skip if already wrapped
            if (cell.querySelector('figure')) { return; }

            var figure = document.createElement('figure');
            figure.className = 'table-icon-figure';
            figure.setAttribute('aria-hidden', 'true');
            figure.appendChild(img.cloneNode(true));
            cell.replaceChild(figure, img);
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Keyboard navigation                                                 */
    /* ------------------------------------------------------------------ */

    /**
     * Move focus between cells using arrow keys.
     * Left/Right navigate within a row; Up/Down navigate between rows.
     *
     * @param {KeyboardEvent} e
     */
    function handleKeydown(e) {
        var key = e.key || e.keyCode;
        var cell = e.target;

        if (!cell || (cell.tagName !== 'TD' && cell.tagName !== 'TH')) {
            return;
        }

        var row   = cell.parentElement;
        var table = row.closest('table');
        if (!table) { return; }

        var cells = toArray(table.querySelectorAll('td, th'));
        var idx   = cells.indexOf(cell);
        var colCount = row.cells.length;
        var target;

        if (key === 'ArrowRight' || key === 39) {
            target = cells[idx + 1] || null;
        } else if (key === 'ArrowLeft' || key === 37) {
            target = cells[idx - 1] || null;
        } else if (key === 'ArrowDown' || key === 40) {
            target = cells[idx + colCount] || null;
        } else if (key === 'ArrowUp' || key === 38) {
            target = cells[idx - colCount] || null;
        } else {
            return;
        }

        if (target) {
            e.preventDefault();
            target.setAttribute('tabindex', '0');
            target.focus();
            // reset previous cell
            cell.setAttribute('tabindex', '-1');
        }
    }

    /**
     * Make all cells in a table reachable via keyboard.
     * @param {Element} table
     */
    function makeTableKeyboardNavigable(table) {
        var cells = qsa('td, th', table);
        cells.forEach(function (cell, i) {
            cell.setAttribute('tabindex', i === 0 ? '0' : '-1');
        });
        table.addEventListener('keydown', handleKeydown);
    }

    /* ------------------------------------------------------------------ */
    /*  Variation class enforcement                                         */
    /* ------------------------------------------------------------------ */

    /**
     * Read data-variation on the component and ensure the matching CSS class
     * is present.  This is a guard in case server-side rendering missed it.
     *
     * @param {Element} component
     */
    function applyVariationClass(component) {
        var variation = component.getAttribute(ATTR_VARIATION);
        if (variation === 'icon') {
            if (!component.classList.contains(CLASS_ICON)) {
                component.classList.add(CLASS_ICON);
            }
        } else {
            if (!component.classList.contains(CLASS_STANDARD)) {
                component.classList.add(CLASS_STANDARD);
            }
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Responsive: add data-label attributes for mobile card layout        */
    /* ------------------------------------------------------------------ */

    /**
     * Read column headers and stamp them onto each data cell as a
     * data-label attribute so CSS can expose them in a mobile card layout.
     *
     * @param {Element} table
     */
    function addDataLabels(table) {
        var headers = toArray(table.querySelectorAll('thead th'));
        if (!headers.length) { return; }

        var headerTexts = headers.map(function (th) {
            return th.textContent.trim();
        });

        var rows = toArray(table.querySelectorAll('tbody tr'));
        rows.forEach(function (row) {
            var tds = toArray(row.querySelectorAll('td'));
            tds.forEach(function (td, colIdx) {
                if (headerTexts[colIdx]) {
                    td.setAttribute('data-label', headerTexts[colIdx]);
                }
            });
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Initialisation                                                      */
    /* ------------------------------------------------------------------ */

    /**
     * Initialise a single table-component element.
     * @param {Element} component
     */
    function initComponent(component) {
        applyVariationClass(component);

        // Enhance icon column if this is an icon-variation table
        var iconWrapper = component.querySelector(SELECTOR_ICON_WRAP) ||
                         (component.classList.contains(CLASS_ICON)
                            ? component.querySelector('.rte-table-content--icon')
                            : null);
        if (iconWrapper) {
            enhanceIconColumn(iconWrapper);
        }

        // Apply keyboard navigation and data-labels to each table inside
        var tables = qsa('table', component);
        tables.forEach(function (table) {
            makeTableKeyboardNavigable(table);
            addDataLabels(table);
        });
    }

    /**
     * Main entry point – initialise all table components on the page.
     */
    function init() {
        var components = qsa(SELECTOR_COMPONENT);
        components.forEach(initComponent);
    }

    /* ------------------------------------------------------------------ */
    /*  Public API                                                          */
    /* ------------------------------------------------------------------ */

    window.MySite = window.MySite || {};
    window.MySite.Table = {
        init: init,
        initComponent: initComponent,
        enhanceIconColumn: enhanceIconColumn,
        addDataLabels: addDataLabels
    };

    /* ------------------------------------------------------------------ */
    /*  Bootstrap                                                           */
    /* ------------------------------------------------------------------ */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOMContentLoaded already fired (e.g. script loaded async)
        init();
    }

    /* AEM Edit-mode: reinitialise after component edits */
    if (window.Granite && window.Granite.author) {
        var channel = window.Granite.author.MessageChannel;
        if (channel) {
            channel.subscribeRequestMessage('cq.wcm.page.editor.component.updated', function (msg) {
                var updated = msg && msg.data && msg.data.component;
                if (updated) {
                    var el = document.querySelector('[data-path="' + updated + '"]');
                    if (el && el.classList.contains('table-component')) {
                        initComponent(el);
                    }
                }
            });
        }
    }

}(document, window));
