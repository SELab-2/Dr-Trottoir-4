import {render, waitFor} from "@testing-library/react";
import {useRouter} from "next/router";
import {BuildingInterface, getBuildingInfo, getBuildingInfoByPublicId} from "@/lib/building";
import {AxiosResponse} from "axios/index";
import BuildingPage from "@/components/building/BuildingPage";
import {getRemarksAtBuildingOfSpecificBuilding, RemarkAtBuildingInterface} from "@/lib/remark-at-building";
import {getFromDate} from "@/lib/date";
import {GarbageCollectionInterface} from "@/lib/garbage-collection";
import {getRegion, RegionInterface} from "@/lib/region";

jest.mock("next/router", () => ({
    useRouter: jest.fn()
}));

jest.mock("@/lib/building", () => ({
    getBuildingInfo: jest.fn(),
    getBuildingInfoByPublicId: jest.fn(),
}));

jest.mock("@/lib/remark-at-building", () => ({
    getRemarksAtBuildingOfSpecificBuilding: jest.fn(),
}));

jest.mock("@/lib/date", () => ({
    getFromDate: jest.fn(),
}));

jest.mock("@/lib/region", () => ({
    getRegion: jest.fn(),
}));

describe("<BuildingPage />", () => {
    const building: BuildingInterface = {
        id: 1,
        syndic: 1,
        name: "Building 1",
        city: "City 1",
        postal_code: "12345",
        street: "Street 1",
        house_number: "1",
        bus: "1",
        client_number: "1",
        duration: "1",
        region: 1,
        public_id: "public1"
    };

    const remarkAtBuilding: RemarkAtBuildingInterface = {
        id: 1,
        student_on_tour: 1,
        building: 1,
        timestamp: new Date(),
        remark: "foo",
        type: "AA"
    };

    const garbageCollection: GarbageCollectionInterface = {
        id: 1,
        building: 1,
        date: new Date(),
        garbage_type: "GFT"
    };

    const region: RegionInterface = {
        id: 1,
        region: "region"
    };

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            query: {id: "1"},
            push: jest.fn(),
        });
        (getBuildingInfo as jest.MockedFunction<typeof getBuildingInfo>).mockResolvedValue({
            data: building
        } as AxiosResponse);
        (getBuildingInfoByPublicId as jest.MockedFunction<typeof getBuildingInfoByPublicId>).mockResolvedValue({
            data: building
        } as AxiosResponse);
        (getRemarksAtBuildingOfSpecificBuilding as jest.MockedFunction<typeof getRemarksAtBuildingOfSpecificBuilding>).mockResolvedValue({
            data: [remarkAtBuilding],
        } as AxiosResponse);
        (getFromDate as jest.MockedFunction<typeof getFromDate>).mockResolvedValue({
            data: garbageCollection,
        } as AxiosResponse);
        (getRegion as jest.MockedFunction<typeof getRegion>).mockResolvedValue({
            data: region,
        } as AxiosResponse);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // it("should render without crashing", async () => {
    //     render(<BuildingPage type="admin"/>);
    //     await waitFor(() => expect(getBuildingInfo).toHaveBeenCalled());
    // });
    //
    // it("should fetch building data by public id when the type is public", async () => {
    //     render(<BuildingPage type="public"/>);
    //     await waitFor(() => expect(getBuildingInfoByPublicId).toHaveBeenCalled());
    // });
});
