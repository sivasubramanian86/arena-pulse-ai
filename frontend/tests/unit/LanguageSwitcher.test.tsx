import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageSwitcher } from "../../src/components/LanguageSwitcher";
import "@testing-library/jest-dom";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/en/nexus",
}));

describe("LanguageSwitcher Unit Component", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders correct locale and opens menu on click", () => {
    render(<LanguageSwitcher currentLocale="en" />);
    const button = screen.getByRole("button", { name: /Select language/i });
    expect(button).toBeInTheDocument();

    // Click to open dropdown
    fireEvent.click(button);
    expect(screen.getByRole("listbox", { name: /Available languages/i })).toBeInTheDocument();

    // Click same locale does nothing but closes dropdown
    const enOpt = screen.getAllByRole("option", { name: /English/i })[0];
    fireEvent.click(enOpt);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("switches language and redirects correctly", () => {
    render(<LanguageSwitcher currentLocale="en" />);
    const button = screen.getByRole("button", { name: /Select language/i });
    fireEvent.click(button);

    const esOpt = screen.getByRole("option", { name: /Español/i });
    fireEvent.click(esOpt);

    expect(mockPush).toHaveBeenCalledWith("/es/nexus");
  });

  it("closes dropdown on outside click", () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <LanguageSwitcher currentLocale="en" />
      </div>
    );
    const button = screen.getByRole("button", { name: /Select language/i });
    fireEvent.click(button);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
