export class ArtifactV2 {
    id: string;
    name: string;
    description: string;
    createdOn: Date;
    createdBy?: string;
    type: string;
    state: string;
    modifiedOn: Date;
    modifiedBy?: string;
    groupId: string;
}