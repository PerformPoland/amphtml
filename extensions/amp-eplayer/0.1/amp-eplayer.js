/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Layout} from '../../../src/layout';
import {user} from '../../../src/log';

/** @const {string} */
const TAG_ = 'amp-eplayer';

/** @const {string} */
const IFRAME_SRC_ = 'https://player.performgroup.com/eplayer/assets/amp-iframe-loader.html';

/** @const {string} */
const SANDBOX_ = 'allow-same-origin allow-scripts allow-top-navigation';

export class AmpEplayer extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.canonicalUrl_ = this.win.document
        .querySelector('link[rel="canonical"]')
        .getAttribute('href') || null;

    /** @private {object} */
    this.params_ = this.element.dataset;

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;
  }

  /** @override */
  layoutCallback() {
    this.assertPosition_();

    const iframe = this.element.ownerDocument.createElement('iframe');

    iframe.setAttribute('name', this.createCfg_());
    iframe.setAttribute('allowfullscreen', true);
    iframe.setAttribute('frameborder', 0);
    iframe.setAttribute('referrerpolicy', 'origin');
    iframe.setAttribute('sandbox', SANDBOX_);

    iframe.src = IFRAME_SRC_;

    this.iframe_ = iframe;
    this.applyFillContent(this.iframe_, /* replacedContent */ true);
    this.toggleLoading(true);
    this.element.appendChild(this.iframe_);

    return this.loadPromise(this.iframe_);
  }

  /**
   * @param {boolean=} opt_onLayout
   * @override
   */
  preconnectCallback(opt_onLayout) {
    this.preconnect.url(IFRAME_SRC_, opt_onLayout);
  }

  /**
   * @param {string=} layout
   * @override
   */
  isLayoutSupported(layout) {
    return layout === Layout.RESPONSIVE || layout === Layout.FIXED;
  }

  /**
   * Checks if the created iframe is positioned outside the first 75%
   * of the viewport or 600px from the top (whichever is smaller)
   * @private
   */
  assertPosition_() {
    const pos = this.element.getLayoutBox();
    const minTop = Math.min(600, this.getViewport().getSize().height * .75);

    user().assert(pos.top >= minTop,
        '<amp-eplayer> elements must be positioned outside the first 75% ' +
        'of the viewport or 600px from the top (whichever is smaller): %s ' +
        ' Current position %s. Min: %s',
        this.element,
        pos.top,
        minTop);
  }

  /**
   * Creates config JSON based on component parameters.
   * @return {string}
   * @private
   */
  createCfg_() {
    const cfg = {
      canonical: this.urlEncode_(this.canonicalUrl_),
      eplayerCfg: this.params_.eplayerCfg,
      width: this.element.offsetWidth,
      height: this.element.offsetHeight,
    };

    return JSON.stringify(cfg);
  }

  /**
   * Encodes URL with encodeURIComponent (1) and btoa (2)
   * @param {string=} url
   * @return {string}
   * @private
   */
  urlEncode_(url) {
    return btoa(encodeURIComponent(decodeURIComponent(url)));
  }
}

AMP.registerElement(TAG_, AmpEplayer);
