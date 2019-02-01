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
import URI from 'vscode-uri';
import { Disposable, Event} from '@theia/core/lib/common';
import { StatusBarEntry } from '@theia/core/lib/browser';

export interface IBaselineResourceProvider {
    getBaselineResource(resource: URI): Promise<URI>;
}

// export const ISCMService = createDecorator<ISCMService>('scm');

export interface ISCMResourceDecorations {
    icon?: URI;
    iconDark?: URI;
    tooltip?: string;
    strikeThrough?: boolean;
    faded?: boolean;

    source?: string;
    letter?: string;
    // color?: ColorIdentifier;
}

export interface ISCMResource {
    readonly resourceGroup: ISCMResourceGroup;
    readonly sourceUri: URI;
    readonly decorations: ISCMResourceDecorations;

    open(): Promise<void>;
}

export interface ISCMResourceGroup extends ISequence<ISCMResource> {
    readonly provider: ISCMProvider;
    readonly label: string;
    readonly id: string;
    readonly hideWhenEmpty: boolean;
    readonly onDidChange: Event<void>;
}

export interface ISCMProvider extends Disposable {
    readonly label: string;
    readonly id: string;
    readonly contextValue: string;

    readonly groups: ISCMResourceGroup[];

    readonly onDidChangeResources: Event<void>;

    readonly rootUri?: string;
    readonly count?: number;
    readonly commitTemplate?: string;
    readonly onDidChangeCommitTemplate?: Event<string>;
    readonly onDidChangeStatusBarCommands?: Event<StatusBarCommand[]>;
    readonly acceptInputCommand?: StatusBarCommand;
    readonly statusBarCommands?: StatusBarCommand[];
    readonly onDidChange: Event<void>;

    getOriginalResource(uri: string): Promise<string>;
}

export interface StatusBarCommand extends StatusBarEntry {
    id: string
}

export const enum InputValidationType {
    Error = 0,
    Warning = 1,
    Information = 2
}

export interface IInputValidation {
    message: string;
    type: InputValidationType;
}

export interface IInputValidator {
    (value: string, cursorPosition: number): Promise<IInputValidation | undefined>;
}

export interface ISCMInput {
    value: string;
    readonly onDidChange: Event<string>;

    placeholder: string;
    readonly onDidChangePlaceholder: Event<string>;

    validateInput: IInputValidator;
    readonly onDidChangeValidateInput: Event<void>;

    visible: boolean;
    readonly onDidChangeVisibility: Event<boolean>;
}

export interface ISCMRepository extends Disposable {
    readonly onDidFocus: Event<void>;
    readonly selected: boolean;
    readonly onDidChangeSelection: Event<boolean>;
    readonly provider: ISCMProvider;
    readonly input: ISCMInput;

    focus(): void;

    setSelected(selected: boolean): void;
}

export const ISCMService = Symbol('ISCMService');
export interface ISCMService {

    // tslint:disable-next-line:no-any
    // readonly _serviceBrand: any;
    readonly onDidAddRepository: Event<ISCMRepository>;
    readonly onDidRemoveRepository: Event<ISCMRepository>;

    readonly repositories: ISCMRepository[];
    readonly selectedRepositories: ISCMRepository[];
    readonly onDidChangeSelectedRepositories: Event<ISCMRepository[]>;

    registerSCMProvider(provider: ISCMProvider): ISCMRepository;
}

export interface ISequence<T> {
    readonly elements: T[];
    readonly onDidSplice: Event<ISplice<T>>;
}

export interface ISplice<T> {
    readonly start: number;
    readonly deleteCount: number;
    readonly toInsert: T[];
}

export interface WorkingDirectoryStatus {

    /**
     * `true` if the repository exists, otherwise `false`.
     */
    readonly exists: boolean;

    /**
     * An array of changed files.
     */
    readonly changes: ScmFileChange[];

    /**
     * The optional name of the branch. Can be absent.
     */
    readonly branch?: string;

    /**
     * The name of the upstream branch. Optional.
     */
    readonly upstreamBranch?: string;

    /**
     * Wraps the `ahead` and `behind` numbers.
     */
    readonly aheadBehind?: { ahead: number, behind: number };

    /**
     * The hash string of the current HEAD.
     */
    readonly currentHead?: string;

    /**
     * `true` if a limit was specified and reached during get `git status`, so this result is not complete. Otherwise, (including `undefined`) is complete.
     */
    readonly incomplete?: boolean;

}

/**
 * Representation of an individual file change in the working directory.
 */
export interface ScmFileChange {

    /**
     * The current URI of the changed file resource.
     */
    readonly uri: string;

    /**
     * The file status.
     */
    readonly status: SCMFileStatus;

    /**
     * The previous URI of the changed URI. Can be absent if the file is new, or just changed and so on.
     */
    readonly oldUri?: string;

    /**
     * `true` if the file is staged, otherwise `false`. If absent, it means, not staged.
     */
    readonly staged?: boolean;

}

/**
 * Enumeration of states that a file resource can have in the working directory.
 */
export enum SCMFileStatus {
    'New',
    'Copied',
    'Modified',
    'Renamed',
    'Deleted',
    'Conflicted',
}
