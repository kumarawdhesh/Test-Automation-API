import React from "react";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";
import "@testing-library/jest-dom";

describe("Footer Component", () => {
    test("renders the Footer component", () => {
        render(<Footer />);
        const footerElement = screen.getByText(/I Link Automation Tool/i);
        expect(footerElement).toBeInTheDocument();
    });

    test("does not render a copyright notice", () => {
        render(<Footer />);
        expect(screen.queryByText(/copyright|electronic arts/i)).not.toBeInTheDocument();
    });

    test("renders the logo image with correct alt text", () => {
        render(<Footer />);
        const logoImage = screen.getByRole("img", { name: "I Link Digital" });
        expect(logoImage).toBeInTheDocument();
        expect(logoImage).toBeInTheDocument();
    });

    test("applies correct styles to the AppBar", () => {
        render(<Footer />);
        const appBar = screen.getByRole("banner");
        expect(appBar).toHaveStyle("position: fixed");
        expect(appBar).toHaveStyle("top: auto");
        expect(appBar).toHaveStyle("bottom: 0");
    });
});