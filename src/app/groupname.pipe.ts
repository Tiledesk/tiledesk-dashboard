import { Pipe, PipeTransform } from '@angular/core';
import { GroupService } from './services/group.service';



@Pipe({ name: 'groupName' })

export class GroupNamePipe implements PipeTransform {

    groupName: string;
    id_group: string;

    constructor(private groupsService: GroupService) { }

    transform(id_group: string): any {
        // console.log('RUN THE PIPE  ', id_group)

        this.groupsService.getGroupById(id_group)
            .subscribe((group: any) => {

                if (group) {
                    // console.log('RUN THE PIPE - GROUP GET BY ID', group);
                    // console.log('RUN THE PIPE - GROUP NAME ', group.name)
                    return this.groupName = group.name
                }

                // return null;
            }, err => {
                // console.error(err);
            }, () => {
                // console.log('POST REQUEST * COMPLETE *');
            });

        // if (this.groupName) {
        //     return this.groupName
        // }

    }

}

