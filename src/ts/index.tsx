import './check-support'; // tslint:disable-line:ordered-imports
import { Component, h, render } from 'preact';

class App extends Component<{}, void> {
  public render () {
    return (
      <p>
        Hello, World!
      </p>
    );
  }
}

const rootNode = document.getElementById('app');

if (rootNode) {
  render(<App />, document.body, rootNode);
}
