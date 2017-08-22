import {Button, Pagination, Next as SwitchNext} from 'next';
import {Dialog, Icon} from 'mext';
import React, { Component } from 'react';
import pureRender from 'pure-render-decorator';

@pureRender
export default class Test extends Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return <div>Hello, world!</div>;
    }
}
