import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileList } from "@/components/student/fileList";

jest.mock("@/lib/picture-of-remark", () => ({
    deletePictureOfRemark: jest.fn(),
}));

describe("FileList", () => {
    const mockSetFiles = jest.fn();

    const files = [
        {
            url: "http://example.com/file1.jpg",
            file: new File([], "file1.jpg"),
            pictureId: null,
        },
    ];

    beforeEach(() => {
        global.URL.createObjectURL = jest.fn();
        mockSetFiles.mockClear();
    });

    it("calls setFiles with new file when a file is added", async () => {
        const file = new File(["hello"], "hello.png", { type: "image/png" });
        render(<FileList files={files} setFiles={mockSetFiles} optional={false} editable={true} />);

        const input = screen.getByTestId("upload-label");
        await userEvent.upload(input, file);

        await waitFor(() => expect(mockSetFiles).toHaveBeenCalled());
        await waitFor(() =>
            expect(mockSetFiles).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ file })]))
        );
    });

    it("calls setFiles with fewer files when a file is removed", async () => {
        render(<FileList files={files} setFiles={mockSetFiles} optional={false} editable={true} />);

        fireEvent.click(screen.getByTestId("delete-button"));

        await waitFor(() => expect(mockSetFiles).toHaveBeenCalled());
    });
});
