import React, { Component } from 'react'
import Layout from './Layout';

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
                                Books
                              </div>
                            </div>
                            <i className="fa fa-book" />
                          </div>
                        </div>
                        <div className="card-footer d-flex align-items-center justify-content-end">
                          <a className="small m-2 text-white stretched-link" href="/books">View books</a>
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
