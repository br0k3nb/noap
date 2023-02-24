import React from "react";
import "./404.css";

export default function Page404 () {
  return (
    <div className="app-container">
      <div className="container-fluid">
        <div className="row no-gutter">
          <div className="col-md-6 d-none d-md-flex bg-image"></div>
            <div className="col-md-6 bg-light">
              <div className="login d-flex align-items-center py-5">
                <div className="container">
                  <div className="row">
                    <div className="col-lg-10 col-xl-7 mx-auto">
                      <h1 className="display-4">404 ERROR</h1>
                      <h3 className="h3-404">Page not found!</h3>
                      <a className="btn btn-dark btn-404" href="/">
                        Go back to home
                      </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};