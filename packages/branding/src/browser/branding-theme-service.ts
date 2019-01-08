/********************************************************************************
 * Copyright (C) 2019 Ericsson and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { BrandingStyle } from './branding-style';
import { BuiltinThemeProvider } from '@theia/core/lib/browser/theming';

class BrandingThemeServiceClass {

    /**
     * Selectors for branding options.
     */
    protected readonly MAIN_SELECTOR = '#theia-main-content-panel';
    protected readonly MENU_SELECTOR = '.theia-icon';

    /**
     * The resource path for the dark theme main icon.
     */
    protected darkMain: string = require('../../src/browser/icons/theia-brand-logo-dark.png');

    /**
     * The resource path for the dark theme menu icon.
     */
    protected darkMenu: string = require('../../src/browser/icons/theia-menu-logo-dark.png');

    /**
     * The resource path for the light theme main icon.
     */
    protected lightMain: string = require('../../src/browser/icons/theia-brand-logo-light.png');

    /**
     * The resource path for the light theme menu icon.
     */
    protected lightMenu: string = require('../../src/browser/icons/theia-menu-logo-light.png');

    /**
     * The main icon size.
     */
    protected mainSize = '40%';

    /**
     * The branding StyleSheet.
     */
    protected style: BrandingStyle;

    constructor() {
        this.style = new BrandingStyle();
        this.updateBranding();
    }

    /**
     * Set the branding options.
     *
     * @param darkMain the dark main icon.
     * @param darkMenu the dark menu icon.
     * @param lightMain the light main icon.
     * @param lightMenu the light menu icon.
     * @param mainSize the main icon size.
     */
    setBranding(
        darkMain: string,
        darkMenu: string,
        lightMain: string,
        lightMenu: string,
        mainSize: string,
    ): void {

        // set dark icons.
        this.darkMain = darkMain;
        this.darkMenu = darkMenu;

        // set light icons.
        this.lightMain = lightMain;
        this.lightMenu = lightMenu;

        // set main icon size.
        this.mainSize = mainSize;

        // update branding.
        this.updateBranding();
    }

    /**
     * Update branding for main, and menu icons.
     */
    private updateBranding(): void {
        this.setMainIcon();
        this.setMenuIcon();
    }

    /**
     * Set the main icon style.
     */
    private setMainIcon(): void {
        this.style.insertRule(this.MAIN_SELECTOR, theme =>
            `
            background-image: url("${theme.id === BuiltinThemeProvider.lightTheme.id ? this.lightMain : this.darkMain}");
            background-position: center center;
            background-repeat: no-repeat;
            background-size: ${this.mainSize};
            `
        );
    }

    /**
     * Set the menu icon style.
     */
    private setMenuIcon(): void {
        this.style.insertRule(this.MENU_SELECTOR, theme =>
            `
            background-image: url("${theme.id === BuiltinThemeProvider.lightTheme.id ? this.lightMenu : this.darkMenu}");
            background-repeat: no-repeat;
            background-position: center;
            background-size: contain;
                `
        );
    }
}

export const BrandingThemeService = new BrandingThemeServiceClass();
