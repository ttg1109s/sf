/*
    viewer/dom-utils.js — Tiny shared DOM helper used by hud.js and panels.js, so both build
    elements the same way without depending on jQuery.
*/

export function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
}
