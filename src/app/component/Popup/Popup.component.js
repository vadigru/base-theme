/* eslint-disable react/no-unused-prop-types */

/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Overlay from 'Component/Overlay/Overlay.component';
import ClickOutside from 'Component/ClickOutside';
import './Popup.style';

export const ESCAPE_KEY = 27;

export default class Popup extends Overlay {
    static propTypes = {
        ...Overlay.propTypes,
        clickOutside: PropTypes.bool,
        title: PropTypes.string
    };

    static defaultProps = {
        ...Overlay.defaultProps,
        clickOutside: true,
        title: ''
    };

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    onVisible() {
        const { onVisible } = this.props;
        this.freezeScroll();
        this.overlayRef.current.focus();

        window.addEventListener('popstate', this.handleWindowPopState);

        history.pushState(
            {
                ...(history.state || {}),
                state: {
                    ...((history.state && history.state.state) || {}),
                    popupOpen: true
                }
            },
            '',
            location.pathname
        );
        onVisible();
    }

    onHide() {
        const { onHide } = this.props;
        window.removeEventListener('popstate', this.handleWindowPopState);

        this.unfreezeScroll();

        onHide();
    }

    hidePopUp = () => {
        const { hideActiveOverlay, goToPreviousNavigationState } = this.props;
        const isVisible = this.getIsVisible();
        if (isVisible) {
            hideActiveOverlay();
            goToPreviousNavigationState();
        }
    };

    handleWindowPopState = () => {
        this.hidePopUp();
    };

    // Close button click don't return user to previous state
    handleClickClose = () => {
        this.hidePopUp();
        history.back();
    }

    handleClickOutside = () => {
        const { clickOutside } = this.props;
        if (!clickOutside) {
            return;
        }
        this.hidePopUp();
        history.back();
    };

    handleKeyDown = (e) => {
        switch (e.keyCode) {
        case ESCAPE_KEY:
            this.hidePopUp();
            break;
        default:
            break;
        }
    };

    renderTitle() {
        const { title } = this.props;
        if (!title) {
            return null;
        }

        return (
            <h3 block="Popup" elem="Heading">
                { title }
            </h3>
        );
    }

    renderContent() {
        const { children } = this.props;
        const isVisible = this.getIsVisible();

        if (!isVisible) {
            return null;
        }

        return (
            <ClickOutside onClick={ this.handleClickOutside }>
                <div block="Popup" elem="Content">
                    <header block="Popup" elem="Header">
                        { this.renderTitle() }
                        <button
                          block="Popup"
                          elem="CloseBtn"
                          aria-label={ __('Close') }
                          onClick={ this.handleClickClose }
                        />
                    </header>
                    { children }
                </div>
            </ClickOutside>
        );
    }

    render() {
        const { mix, areOtherOverlaysOpen } = this.props;
        const isVisible = this.getIsVisible();

        return createPortal(
            <div
              ref={ this.overlayRef }
              block="Popup"
              mods={ { isVisible, isInstant: areOtherOverlaysOpen } }
              mix={ { ...mix, mods: { ...mix.mods, isVisible } } }
            >
                { this.renderContent() }
            </div>,
            document.body
        );
    }
}
