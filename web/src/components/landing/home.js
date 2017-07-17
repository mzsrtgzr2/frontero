import React from 'react'
import {Card,Icon,CardTitle,Modal,Button} from 'react-materialize';

export default React.createClass({  
  render :function() {
    return (<div>
      <div className="parallax-container">
        <div className="section no-pad-bot">
          <div className="container">
            <div className="row center">
              <div className="col s12">
                <h3 className="center amber-text text-lighten-2">Make your life easier...</h3>

              </div>
            </div>
          </div>
        </div>
        <div className="parallax"><img src="../images/back2.jpg"/></div>
      </div>
            <div className="row blue-grey darken-4 splitterWrapper">
              <div className="container">
                <div className="col s12 l4 center">
                  <Card className='amber darken-2' textClassName='white-text' actions={[<a className="btn waves-effect waves-light deep-orange darken-4" href='#'>This is a link</a>]}>
                    <div>
                      <div className="card-title">
                        Quick Deploy
                      </div>
                      <Icon center className="large">av_timer</Icon>
                      <div>asdsadsa</div>
                  </div>
                  </Card>
                </div>
                <div className="col s12 l4 center">
                  <Card className='blue-text text-darken-2 amber darken-2' textClassName='white-text' actions={[<a className="btn waves-effect waves-light deep-orange darken-4" href='#'>This is a link</a>]}>
                    <div>
                      <div className="card-title">
                        Engage Users
                      </div>
                      <Icon center className="large">visibility</Icon>
                      <div>I am a very simple card.</div>
                  </div>
                  </Card>
                </div>
                <div className="col s12 l4 center">
                  <Card className='amber darken-2' textClassName='white-text' actions={[<a className="btn waves-effect waves-light deep-orange darken-4" href='#'>This is a link</a>]}>
                    <div>
                      <div className="card-title">
                        Increase Traffic
                      </div>
                      <Icon center className="large">trending_up</Icon>
                      <div>I am a very simple card.</div>
                  </div>
                  </Card>
                </div>
              </div>
            </div>
            <div className="row splitterWrapper blue-grey darken-4">
              <div className="col s12 center">
                  <span className="flow-text white-text">Integrate faster stronger better</span>
              </div>
            </div>
            <div className="row">
                <div className="col s6 center">
                </div>
                <div className="col s6 center">
                </div>
            </div>
            <div className="row splitterWrapper blue-grey darken-4">
              <div className="col s12 center">
                  <span className="flow-text white-text">Features that give you more time for coffee breaks</span>
              </div>
            </div>
            <div className="row">
                <div className="col s6 center">
                </div>
                <div className="col s6 center">
                </div>
            </div>
      </div>
    )}
})
