import { HttpClient } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { BaseResourceModel } from '../../shared/models/base-resource.model';
import { Injector } from '@angular/core';



export abstract class BaseResourceService<T extends BaseResourceModel>{


    protected http: HttpClient;

    constructor(protected apiPath: string, protected injector: Injector) {
        this.http = injector.get(HttpClient);
    }

    getById(id: number): Observable<T> {
        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
            catchError(this.handleError),
            map(this.jsonDataToResource)
        )
    }

    getAll(): Observable<T[]> {
        return this.http.get(this.apiPath).pipe(
            catchError(this.handleError),
            map(this.jsonDataToResources)
        )
    }

    create(resource: T): Observable<T> {
        return this.http.post(this.apiPath, resource).pipe(
            catchError(this.handleError),
            map(this.jsonDataToResource)
        );
    }

    update(resource: T): Observable<T> {
        const url = `${this.apiPath}/${resource.id}`;
        return this.http.put(this.apiPath, resource).pipe(
            catchError(this.handleError),
            map(() => resource)
        );
    }

    delete(id: number): Observable<any> {
        const url = `${this.apiPath}/${id}`;
        return this.http.delete(url).pipe(
            catchError(this.handleError),
            map(() => null)
        );
    }

    protected jsonDataToResource(jsonData: any): T {
        return jsonData as T;
    }

    protected jsonDataToResources(jsondData: any[]): T[] {
        const resources: T[] = [];

        jsondData.forEach(element => resources.push(element as T));

        return resources;
    }

    protected handleError(error: any): Observable<any> {
        console.log("error =>", error)
        return throwError(error);
    }
}