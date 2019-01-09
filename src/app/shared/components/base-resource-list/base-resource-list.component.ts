import { OnInit } from '@angular/core';

import { BaseResourceService } from '../../services/base-resource.service';
import { BaseResourceModel } from '../../models/base-resource.model';

export abstract class BaseResourceList<T extends BaseResourceModel> implements OnInit {

    resources: T[] = [];

    constructor(private resourceService: BaseResourceService<T>) {

    }

    ngOnInit() {
        this.resourceService.getAll().subscribe(
            resources => this.resources = resources.sort((a, b) => b.id - a.id),
            error => alert('Erro ao carregar a lista')
        );
    }


    deleteResource(resource: T) {

        const mustDelete = confirm('Deseja realmente excluir este item?')

        if (!mustDelete) {
            return;
        }

        this.resourceService.delete(resource.id).subscribe(
            () => this.resources = this.resources.filter(element => element != resource),
            () => console.log('error ao excluir')
        );
    }

}
