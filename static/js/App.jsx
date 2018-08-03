import React from "react";

export default class App extends React.Component {
  render() {
    return (
      <p>
      Dude!!
      <br />
      How's it hanging?
      <br />I'm fine. Thanks :)
      <br />asdf
    <br />yoyo
    <form method="POST">
      <input type="text" className="username" placeholder="User name" />
      <input type="text" className="message" placeholder="Message" />
      <input type="submit" />
      </form>
      </p>);
  }
}
