import { render, screen, fireEvent, act } from "@testing-library/react";
import { MultiModalHub } from "../../src/components/MultiModalHub";
import "@testing-library/jest-dom";

describe("MultiModalHub Unit Component", () => {
  it("renders both Vision AI and Audio PA sections", () => {
    render(<MultiModalHub />);
    const region = screen.getByRole("region", { name: /Multimodal AI Upload & Speech Hub/i });
    expect(region).toBeInTheDocument();

    // Vision AI section
    expect(screen.getByText(/Vision AI Analyst/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag & Drop file here/i)).toBeInTheDocument();

    // Audio PA section
    expect(screen.getByText(/Public Address \(PA\) Audio Synthesizer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Broadcast Announcement Script/i)).toBeInTheDocument();
  });

  it("handles file upload via file input and triggers dragover/dragleave states", () => {
    const { container } = render(<MultiModalHub />);

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    const file = new File(["gate"], "gate.png", { type: "image/png" });
    fireEvent.change(fileInput!, { target: { files: [file] } });

    const dropZone = screen.getByRole("button", { name: /Upload file area/i });
    expect(dropZone).toBeInTheDocument();

    // Simulate dragenter → dragActive = true
    act(() => {
      fireEvent.dragEnter(dropZone, { dataTransfer: { files: [] } });
    });
    expect(dropZone).toHaveClass("border-blue-500");

    // Simulate dragleave → dragActive = false
    act(() => {
      fireEvent.dragLeave(dropZone, { dataTransfer: { files: [] } });
    });
    expect(dropZone).not.toHaveClass("border-blue-500");
  });

  it("simulates file drop and enables Analyze button", () => {
    // Mock FileReader to synchronously call onload
    const mockFileReader = {
      readAsDataURL: jest.fn(function (this: { onload?: (e: ProgressEvent<FileReader>) => void }) {
        if (this.onload) {
          this.onload({ target: { result: "data:image/png;base64,mock" } } as ProgressEvent<FileReader>);
        }
      }),
      onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
    };
    const FileReaderSpy = jest.spyOn(window, "FileReader")
      .mockImplementation(() => mockFileReader as unknown as FileReader);

    render(<MultiModalHub />);

    const dropZone = screen.getByRole("button", { name: /Upload file area/i });
    const file = new File(["gate"], "gate.png", { type: "image/png" });

    // Simulate dragover first (required for drop to be accepted)
    fireEvent.dragOver(dropZone, { dataTransfer: { files: [file] } });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] }
    });

    // After drop — the preview image should appear (FileReader mock fires synchronously)
    expect(screen.getByAltText("Uploaded Preview")).toBeInTheDocument();

    // Analyze button should now be enabled
    const analyzeBtn = screen.getByRole("button", { name: /Run Vision AI crowd analysis/i });
    expect(analyzeBtn).not.toBeDisabled();

    FileReaderSpy.mockRestore();
  });

  it("handles Vision AI analysis flow with async delay", async () => {
    const mockFileReader = {
      readAsDataURL: jest.fn(function (this: { onload?: (e: ProgressEvent<FileReader>) => void }) {
        if (this.onload) {
          this.onload({ target: { result: "data:image/png;base64,mock" } } as ProgressEvent<FileReader>);
        }
      }),
      onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
    };
    jest.spyOn(window, "FileReader").mockImplementation(() => mockFileReader as unknown as FileReader);

    render(<MultiModalHub />);

    const dropZone = screen.getByRole("button", { name: /Upload file area/i });
    const file = new File(["gate"], "gate.png", { type: "image/png" });

    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

    expect(await screen.findByAltText("Uploaded Preview")).toBeInTheDocument();

    const analyzeBtn = screen.getByRole("button", { name: /Run Vision AI crowd analysis/i });
    fireEvent.click(analyzeBtn);

    // Wait for 1200ms analysis simulation
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1300));
    });

    expect(screen.getByText(/Vision AI Scan complete/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();

    jest.restoreAllMocks();
  });

  it("handles audio synthesis flow with async delay", async () => {
    render(<MultiModalHub />);

    const audioTextarea = screen.getByLabelText(/Broadcast Announcement Script/i);
    fireEvent.change(audioTextarea, {
      target: { value: "Attention all fans in Zone 1, please proceed to Gate C." }
    });

    const synthesizeBtn = screen.getByRole("button", { name: /Synthesize audio file/i });
    expect(synthesizeBtn).not.toBeDisabled();
    fireEvent.click(synthesizeBtn);

    // Wait for 1000ms synthesis simulation + buffer to bring playback online
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    });

    // Check that playback is active
    expect(screen.getByText(/Broadcasting Live Announcement/i)).toBeInTheDocument();

    // Now wait for 4000ms playback to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 4100));
    });

    expect(screen.queryByText(/Broadcasting Live Announcement/i)).not.toBeInTheDocument();
  }, 10000);

  it("rejects non-image file and shows no preview", () => {
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onload: null,
    };
    jest.spyOn(window, "FileReader").mockImplementation(() => mockFileReader as unknown as FileReader);

    render(<MultiModalHub />);

    const dropZone = screen.getByRole("button", { name: /Upload file area/i });
    const file = new File(["data"], "report.pdf", { type: "application/pdf" });

    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

    // Non-image: FileReader.readAsDataURL should NOT be called
    expect(mockFileReader.readAsDataURL).not.toHaveBeenCalled();
    expect(screen.queryByAltText("Uploaded Preview")).not.toBeInTheDocument();

    jest.restoreAllMocks();
  });

  it("handles file upload via hidden file input onChange (covers handleFileInput L52-53)", () => {
    const mockFileReader = {
      readAsDataURL: jest.fn(function (this: { onload?: (e: ProgressEvent<FileReader>) => void }) {
        if (this.onload) {
          this.onload({ target: { result: "data:image/png;base64,mock" } } as ProgressEvent<FileReader>);
        }
      }),
      onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
    };
    jest.spyOn(window, "FileReader").mockImplementation(() => mockFileReader as unknown as FileReader);

    render(<MultiModalHub />);

    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    const file = new File(["gate"], "camera.jpg", { type: "image/jpeg" });
    Object.defineProperty(fileInput, "files", { value: [file], configurable: true });
    fireEvent.change(fileInput);

    expect(mockFileReader.readAsDataURL).toHaveBeenCalled();
    jest.restoreAllMocks();
  });

  it("covers dropzone onClick without throwing (covers L100 fileInputRef.click)", () => {
    render(<MultiModalHub />);
    const dropZone = screen.getByRole("button", { name: /Upload file area/i });
    expect(() => fireEvent.click(dropZone)).not.toThrow();
  });

  it("covers early return when no file is selected for analysis", () => {
    render(<MultiModalHub />);
    const analyzeBtn = screen.getByRole("button", { name: /Run Vision AI crowd analysis/i });
    expect(analyzeBtn).toBeDisabled();

    // Trigger onClick handler directly via React internals to cover early return
    const propsKey = Object.keys(analyzeBtn).find(
      (k) => k.startsWith("__reactProps") || k.startsWith("__reactEventHandlers")
    );
    if (propsKey) {
      (analyzeBtn as any)[propsKey].onClick({ preventDefault: () => {} });
    }
  });

  it("covers early return when no text is provided for synthesis", () => {
    render(<MultiModalHub />);
    const synthesizeBtn = screen.getByRole("button", { name: /Synthesize audio file/i });
    expect(synthesizeBtn).toBeDisabled();

    // Trigger onClick handler directly via React internals to cover early return
    const propsKey = Object.keys(synthesizeBtn).find(
      (k) => k.startsWith("__reactProps") || k.startsWith("__reactEventHandlers")
    );
    if (propsKey) {
      (synthesizeBtn as any)[propsKey].onClick({ preventDefault: () => {} });
    }
  });

  it("handles FileReader load when target or result is null/undefined", () => {
    const mockFileReader = {
      readAsDataURL: jest.fn(function (this: { onload?: (e: any) => void }) {
        if (this.onload) {
          this.onload({ target: undefined });
        }
      }),
      onload: null as ((e: any) => void) | null,
    };
    const FileReaderSpy = jest.spyOn(window, "FileReader")
      .mockImplementation(() => mockFileReader as unknown as FileReader);

    render(<MultiModalHub />);
    const dropZone = screen.getByRole("button", { name: /Upload file area/i });
    const file = new File(["gate"], "gate.png", { type: "image/png" });

    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });
    FileReaderSpy.mockRestore();
  });

  it("handles loading demo assets (Stadium Image and Security Video)", () => {
    render(<MultiModalHub />);
    
    // Click Stadium Image demo button
    const imgBtn = screen.getByRole("button", { name: "Stadium Image" });
    fireEvent.click(imgBtn);
    expect(screen.getByAltText("Uploaded Preview")).toBeInTheDocument();

    // Click Security Video demo button
    const vidBtn = screen.getByRole("button", { name: "Security Video" });
    fireEvent.click(vidBtn);
    expect(screen.getByText("security_cam.mp4")).toBeInTheDocument();
  });

  it("handles playing demo announcement audio", async () => {
    // Mock Audio object
    const playMock = jest.fn().mockResolvedValue(true);
    const mockAudioInstance = {
      play: playMock,
      onended: null as (() => void) | null,
    };
    window.Audio = jest.fn().mockImplementation(() => mockAudioInstance) as any;

    render(<MultiModalHub />);
    
    const playBtn = screen.getByRole("button", { name: /Play demo announcement audio/i });
    fireEvent.click(playBtn);
    expect(screen.getByText("Broadcasting Live Announcement")).toBeInTheDocument();

    // Trigger onended callback to close visualizer
    if (mockAudioInstance.onended) {
      act(() => {
        mockAudioInstance.onended!();
      });
    }
    expect(screen.queryByText("Broadcasting Live Announcement")).not.toBeInTheDocument();
  });

  it("handles playing demo announcement audio when playback fails", async () => {
    const playMock = jest.fn().mockRejectedValue(new Error("Playback failed"));
    const mockAudioInstance = {
      play: playMock,
      onended: null as (() => void) | null,
    };
    window.Audio = jest.fn().mockImplementation(() => mockAudioInstance) as any;

    render(<MultiModalHub />);
    
    const playBtn = screen.getByRole("button", { name: /Play demo announcement audio/i });
    fireEvent.click(playBtn);
    expect(screen.getByText("Broadcasting Live Announcement")).toBeInTheDocument();
  });
});
