import React, { Component } from 'react'
import Layout from './Layout';
import { Link } from 'react-router-dom';
export default class Dashboard extends Component {
    render() {
        return (
          <div>
            <Layout>
              <section className="content-wrapper">
                  <div className="row mx-2">
                    <div className="col-md-4 mt-4">
                      <div className="card bg-primary text-white mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="mr-3">
                              <div className="text-lg font-weight-bold">
                                Master Sources
                              </div>
                            </div>
                            <i className="fa fa-book" />
                          </div>
                        </div>
                        <div className="card-footer d-flex align-items-center justify-content-end">
                          <Link className="small m-2 text-white stretched-link" to="/mastersources">View master sources</Link>
                          <div className="small text-white">
                            <i className="fas fa-angle-right" />
                          </div>
                        </div>
                      </div>
                      <div className="card bg-primary text-white mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="mr-3">
                              <div className="text-lg font-weight-bold">
                                Beta List
                              </div>
                            </div>
                            <i className="nav-icon fas fa-list"></i>
                          </div>
                        </div>
                        <div className="card-footer d-flex align-items-center justify-content-end">
                          <Link className="small m-2 text-white stretched-link" to="/betalist">View Betalist</Link>
                          <div className="small text-white">
                            <i className="fas fa-angle-right" />
                          </div>
                        </div>

                      </div>
                    </div>
                    <div className="col-md-4 mt-4">
                      <div className="card bg-primary text-white mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="mr-3">
                              <div className="text-lg font-weight-bold">
                                Chat Logs
                              </div>
                            </div>
                            <i className="fa fa-comments" />
                          </div>
                        </div>
                        <div className="card-footer d-flex align-items-center justify-content-end">
                          <Link className="small m-2 text-white stretched-link" to="/chatlog">View Chat Logs</Link>
                          <div className="small text-white">
                            <i className="fas fa-angle-right" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mt-4">
                      <div className="card bg-primary text-white mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="mr-3">
                              <div className="text-lg font-weight-bold">
                                Users 
                              </div>
                            </div>
                            <i className="fa fa-users" />
                          </div>
                        </div>
                        <div className="card-footer d-flex align-items-center justify-content-end">
                          <Link className="small m-2 text-white stretched-link" to="/users">View Users</Link>
                          <div className="small text-white">
                            <i className="fas fa-angle-right" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
            </Layout>
          </div>

        )
    }
}



