/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {multiInject, injectable} from "inversify";

export const IOpenerService = Symbol("IOpenerService");

export interface IOpenerService {
    /**
     * Open a resource for the given input.
     * Return undefined if this service cannot handle the given input.
     */
    open<ResourceInput, Resource>(input: ResourceInput): Promise<Resource> | undefined;
}

@injectable()
export class OpenerService implements IOpenerService {

    constructor(@multiInject(IOpenerService) protected readonly services: IOpenerService[]) {
    }

    open<ResourceInput, Resource>(input: ResourceInput): Promise<Resource> | undefined {
        for (const service of this.services) {
            const promise = service.open(input);
            if (promise) {
                return promise;
            }
        }
        return undefined;
    }

}
