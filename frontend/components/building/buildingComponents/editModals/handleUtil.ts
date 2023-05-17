import React, {ChangeEvent} from "react";
import {
    BuildingInterface,
    BuildingPostInterface,
    BuildingSyndicPostInterface,
    getNewPublicId,
    patchBuildingInfo
} from "@/lib/building";
import {handleError} from "@/lib/error";

export function getNewPublicIdUtil(
    event: React.MouseEvent<HTMLButtonElement> | undefined,
    formData: BuildingInterface | BuildingPostInterface | BuildingSyndicPostInterface,
    setFormData: (value: BuildingInterface | BuildingPostInterface | BuildingSyndicPostInterface | any) => void,
    setErrorMessages: (s: string[]) => void
): void {

    event?.preventDefault();

    getNewPublicId()
        .then((res) => {
            setFormData({
                ...formData,
                public_id: res.data.public_id,
            });
            setErrorMessages([]);
        })
        .catch((error) => {
            setErrorMessages(handleError(error));
        });
}


export function handleInputChangeUtil(event: ChangeEvent<HTMLInputElement> | ChangeEvent<any>,
                                      formData: BuildingInterface | BuildingPostInterface | BuildingSyndicPostInterface,
                                      setFormData: (value: BuildingInterface | BuildingPostInterface | BuildingSyndicPostInterface | any) => void): void {
    event.preventDefault();

    const name: string = event.target.name;
    const value: string = event.target.value;

    setFormData({
        ...formData,
        [name]: value,
    });

}


export async function handleSubmitUtil(
    event: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<any> | undefined,
    formData: BuildingInterface | BuildingPostInterface | BuildingSyndicPostInterface,
    building: BuildingInterface | null,
    setBuilding: (value: BuildingInterface) => void,
    closeModal: () => void,
    setErrorMessages: (s: string[]) => void
) {
    event?.preventDefault();

    let toSend: any = {};
    for (const [key, value] of Object.entries(formData)) {
        // @ts-ignore
        if (value && (!building || building[key] != value)) {
            toSend[key] = value;
        }
    }

    if (Object.keys(toSend).length === 0) return;

    patchBuildingInfo("" + building?.id, toSend)
        .then((res) => {
            setBuilding(res.data);
            setErrorMessages([]);
            closeModal();
        })
        .catch((error) => {
            setErrorMessages(handleError(error));
        });
}


