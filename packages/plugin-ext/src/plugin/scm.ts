/********************************************************************************
 * Copyright (C) 2018 Red Hat, Inc. and others.
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

import * as theia from '@theia/plugin';
import {PLUGIN_RPC_CONTEXT, ScmExt, ScmMain} from '../api/plugin-api';
import {RPCProtocol} from '../api/rpc-protocol';
import {StatusBarCommand} from '@theia/scm/lib/common/scm';

export class ScmExtImpl implements ScmExt {
    private readonly proxy: ScmMain;

    constructor(rpc: RPCProtocol) {
        this.proxy = rpc.getProxy(PLUGIN_RPC_CONTEXT.SCM_MAIN);
    }

    createSourceControl(id: string, label: string, rootUri?: theia.Uri): theia.SourceControl {
        return new ExtHostSourceControl(this.proxy, id, label, rootUri);
    }
}

class InputBoxImpl implements theia.SourceControlInputBox {
    private _placeholder: string;
    private _value: string;

    constructor(private proxy: ScmMain, private handle: number) {
    }

    get value(): string {
        return this._value;
    }

    set value(value: string) {
        this._value = value;
        this.proxy.$setInputBoxValue(this.handle, value);
    }
    get placeholder(): string {
        return this._placeholder;
    }

    set placeholder(placeholder: string) {
        this._placeholder = placeholder;
        this.proxy.$setInputBoxPlaceholder(this.handle, placeholder);
    }
}

class ExtHostSourceControl implements theia.SourceControl {
    private static _handle: number = 0;
    private handle: number = ExtHostSourceControl._handle++;

    private readonly _inputBox: theia.SourceControlInputBox;
    private _count: number | undefined = undefined;
    private _quickDiffProvider: theia.QuickDiffProvider | undefined = undefined;
    private _commitTemplate: string | undefined = undefined;
    private _acceptInputCommand: theia.Command | undefined = undefined;
    private _statusBarCommands: theia.Command[] | undefined = undefined;
    constructor(
        private proxy: ScmMain,
        private _id: string,
        private _label: string,
        private _rootUri?: theia.Uri
    ) {
        this._inputBox = new InputBoxImpl(proxy, this.handle);
        this.proxy.$registerSourceControl(this.handle, _id, _label, _rootUri ? _rootUri.path : undefined);
    }

    get id(): string {
        return this._id;
    }

    get label(): string {
        return this._label;
    }

    get rootUri(): theia.Uri | undefined {
        return this._rootUri;
    }

    createResourceGroup(id: string, label: string): theia.SourceControlResourceGroup {
        return new SourceControlResourceGroupImpl(this.proxy, this.handle, id, label);
    }

    get inputBox(): theia.SourceControlInputBox {
        return this._inputBox;
    }

    get count(): number | undefined {
        return this._count;
    }

    set count(count: number | undefined) {
        if (this._count !== count) {
            this._count = count;
            this.proxy.$updateSourceControl(this.handle, { count });
        }
    }

    get quickDiffProvider(): theia.QuickDiffProvider | undefined {
        return this._quickDiffProvider;
    }

    set quickDiffProvider(quickDiffProvider: theia.QuickDiffProvider | undefined) {
        this._quickDiffProvider = quickDiffProvider;
        this.proxy.$updateSourceControl(this.handle, { hasQuickDiffProvider: !!quickDiffProvider });
    }

    get commitTemplate(): string | undefined {
        return this._commitTemplate;
    }

    set commitTemplate(commitTemplate: string | undefined) {
        this._commitTemplate = commitTemplate;
        this.proxy.$updateSourceControl(this.handle, { commitTemplate });
    }

    dispose(): void {
        this.proxy.$unregisterSourceControl(this.handle);
    }

    get acceptInputCommand(): theia.Command | undefined {
        return this._acceptInputCommand;
    }

    set acceptInputCommand(acceptInputCommand: theia.Command | undefined) {
        this._acceptInputCommand = acceptInputCommand;

        if (acceptInputCommand) {
            const command: StatusBarCommand = {
                id: acceptInputCommand.id,
                text: acceptInputCommand.label ? acceptInputCommand.label : '',
                alignment: 1
            };
            this.proxy.$updateSourceControl(this.handle, { acceptInputCommand: command });
        }
    }

    get statusBarCommands(): theia.Command[] | undefined {
        return this._statusBarCommands;
    }

    set statusBarCommands(statusBarCommands: theia.Command[] | undefined) {
        this._statusBarCommands = statusBarCommands;
        if (statusBarCommands) {
            const commands = statusBarCommands.map(statusBarCommand => {
                const command = {
                    id: statusBarCommand.id,
                    text: statusBarCommand.label ? statusBarCommand.label : '',
                    alignment: 1
                };
                return command;
            });
            this.proxy.$updateSourceControl(this.handle, {statusBarCommands: commands});
        }
    }
}

class SourceControlResourceGroupImpl implements theia.SourceControlResourceGroup {

    private _hideWhenEmpty: boolean | undefined = undefined;
    private _resourceStates: theia.SourceControlResourceState[] = [];

    constructor(
        private proxy: ScmMain,
        private handle: number,
        private _id: string,
        private _label: string,
    ) {
        this.proxy.$registerGroup(handle, _id, _label);
    }

    get id(): string {
        return this._id;
    }

    get label(): string {
        return this._label;
    }

    set label(label: string) {
        this._label = label;
        this.proxy.$updateGroupLabel(this.handle, label);
    }

    get hideWhenEmpty(): boolean | undefined {
        return this._hideWhenEmpty;
    }

    set hideWhenEmpty(hideWhenEmpty: boolean | undefined) {
        this._hideWhenEmpty = hideWhenEmpty;
        this.proxy.$updateGroup(this.handle, { hideWhenEmpty });
    }

    get resourceStates(): theia.SourceControlResourceState[] {
        return this._resourceStates;
    }

    set resourceStates(resources: theia.SourceControlResourceState[]) {
        this._resourceStates = resources;
    }

    dispose(): void {
        this.proxy.$unregisterGroup(this.handle);
    }
}
