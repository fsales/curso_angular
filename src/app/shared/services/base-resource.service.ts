import { HttpClient } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { BaseResourceModel } from '../../shared/models/base-resource.model';
import { Injector } from '@angular/core';



export abstract class BaseResourceService<T extends BaseResourceModel>{


    protected http: HttpClient;

    constructor(protected apiPath: string,
        protected injector: Injector,
        protected jsonDataToResourceFn: (jsonData: any) => T) {
        this.http = injector.get(HttpClient);
    }

    getById(id: number): Observable<T> {
        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
            map(this.jsonDataToResource.bind(this)),
            catchError(this.handleError)

        )
    }

    getAll(): Observable<T[]> {
        return this.http.get(this.apiPath).pipe(
            map(this.jsonDataToResources.bind(this)),
            catchError(this.handleError)

        )
    }

    create(resource: T): Observable<T> {
        return this.http.post(this.apiPath, resource).pipe(
            map(this.jsonDataToResource.bind(this)),
            catchError(this.handleError)

        );
    }

    update(resource: T): Observable<T> {
        const url = `${this.apiPath}/${resource.id}`;
        return this.http.put(this.apiPath, resource).pipe(
            map(() => resource),
            catchError(this.handleError)

        );
    }

    delete(id: number): Observable<any> {
        const url = `${this.apiPath}/${id}`;
        return this.http.delete(url).pipe(
            map(() => null),
            catchError(this.handleError)

        );
    }

    protected jsonDataToResource(jsonData: any): T {
        return this.jsonDataToResourceFn(jsonData);
    }

    protected jsonDataToResources(jsondData: any[]): T[] {
        const resources: T[] = [];

        jsondData.forEach(element => resources.push(this.jsonDataToResourceFn(element)));

        return resources;
    }

    protected handleError(error: any): Observable<any> {
        console.log("error =>", error)
        return throwError(error);
    }
}