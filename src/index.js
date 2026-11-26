import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material";
import { appRouter } from "./routes";
import theme from "./theme";
import { store } from "./store/store";
import { FALCON_API, GUARDIAN_API } from "../environment";
import { installDemoFetch } from "./api/demoApi";
// import './styles.scss'; // Import your SCSS file

installDemoFetch(FALCON_API, GUARDIAN_API);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
   
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<RouterProvider router={appRouter} />
			</ThemeProvider>
		</Provider>
);
