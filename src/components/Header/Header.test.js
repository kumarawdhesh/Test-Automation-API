import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Header from "./Header";
import { isUserAuthenticated } from "../../utils/utility";
import "@testing-library/jest-dom";


jest.mock("../../utils/utility", () => ({
    isUserAuthenticated: jest.fn(),
}));

jest.mock("../AvatarLetter/AvatarLetter", () => () => <div data-testid="avatar-letter"></div>);

const mockStore = configureStore([]);

describe("Header Component", () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            auth: {
                user: {
                    full_name: "John Doe",
                    role: "Admin",
                },
            },
        });
    });

    it("renders the Header component with user details when authenticated", () => {
        isUserAuthenticated.mockReturnValue(true);

        render(
            <Provider store={store}>
                <Header isSidebarOpen={true} />
            </Provider>
        );

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Admin")).toBeInTheDocument();
        expect(screen.getByTestId("avatar-letter")).toBeInTheDocument();
    });

    it("does not render user details when not authenticated", () => {
        isUserAuthenticated.mockReturnValue(false);

        render(
            <Provider store={store}>
                <Header isSidebarOpen={true} />
            </Provider>
        );

        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
        expect(screen.queryByText("Admin")).not.toBeInTheDocument();
        expect(screen.queryByTestId("avatar-letter")).not.toBeInTheDocument();
    });

    it("adjusts AppBar width based on isSidebarOpen prop", () => {
        isUserAuthenticated.mockReturnValue(true);

        const { rerender } = render(
            <Provider store={store}>
                <Header isSidebarOpen={true} />
            </Provider>
        );

        const appBar = screen.getByRole("banner");
        expect(appBar).toHaveStyle("width: calc(100% - 240px)");

        rerender(
            <Provider store={store}>
                <Header isSidebarOpen={false} />
            </Provider>
        );

        expect(appBar).toHaveStyle("width: calc(100% - 85px)");
    });
});