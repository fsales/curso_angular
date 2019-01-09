import { OnInit, AfterContentChecked, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validator, Form, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

import { switchMap } from "rxjs/operators";
import * as toastr from 'toastr';


export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

    currentAction: string;
    resourceForm: FormGroup;
    pageTitle: string;
    serverErrorMessages: string[] = null;
    submittingForm: boolean = false;

    protected route: ActivatedRoute;
    protected router: Router;
    protected formBuilder: FormBuilder;

    constructor(
        public resource: T,
        protected injector: Injector,
        protected resourceService: BaseResourceService<T>,
        protected jsonDataToResourceFn: (jsonData: any) => T
    ) {
        this.route = injector.get(ActivatedRoute);
        this.router = injector.get(Router);
        this.formBuilder = injector.get(FormBuilder);
    }

    ngOnInit() {
        this.setCurrentAction();
        this.buildResourceForm();
        this.loadResource();
    }


    ngAfterContentChecked() {
        this.setPageTitle();
    }

    submitForm() {
        this.submittingForm = true;

        if (this.currentAction == "new") {
            this.createResource();
        } else {
            this.updateResource();
        }

    }
    protected updateResource(): any {
        const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
        this.resourceService.update(resource).subscribe(
            resource => this.actionsForSuccess(resource),
            error => this.actionsForError(error)
        );

    }
    protected createResource(): any {
        const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
        this.resourceService.create(resource).subscribe(
            resource => this.actionsForSuccess(resource),
            error => this.actionsForError(error)
        );
    }
    protected actionsForError(error: any): void {
        toastr.error("Ocorreu um erro ao processar a sua solicitação");
        this.submittingForm = false;

        if (error.status === 422) {
            this.serverErrorMessages = JSON.parse(error._body).errors;
        } else {
            this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde."];
        }

    }

    protected actionsForSuccess(resource: T): void {
        toastr.success("Solicitação processada com sucesso!");

        const baseComponentPath: string = this.route.snapshot.parent.url[0].path;
        //recarregar compomentes -- redirect/reload compoment page
        this.router.navigateByUrl(baseComponentPath, { skipLocationChange: true }).then(
            () => this.router.navigate([baseComponentPath, resource.id, "edit"])
        );
    }

    protected setPageTitle() {
        if (this.currentAction == "new")
            this.pageTitle = this.creationPageTitle();
        else {
            this.pageTitle = this.editionPageTitle();
        }

    }

    protected creationPageTitle(): string {
        return "Novo";
    }

    protected editionPageTitle(): string {
        return "Edição";
    }

    protected loadResource(): any {
        if (this.currentAction == "edit") {
            this.route.paramMap.pipe(
                switchMap(params => this.resourceService.getById(+params.get('id')))
            ).subscribe(
                (resource) => {
                    this.resource = resource;
                    this.resourceForm.patchValue(resource);
                },
                (error) => console.log("ocorreu um error")
            );
        }
    }

    protected setCurrentAction(): any {
        if (this.route.snapshot.url[0].path == "new") {
            this.currentAction = "new";
        } else {
            this.currentAction = "edit";
        }
    }

    protected abstract buildResourceForm():void;
}
