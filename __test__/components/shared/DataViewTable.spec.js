import React from 'react';
import { shallow, mount, render } from 'enzyme';
import { spy } from 'sinon';
import _ from 'lodash';
import fs from 'fs';

import DataViewTable from '../../../src/components/shared/DataViewTable';

const mockProps = {
  onSelectChange: () => {},
  onRowClicked: (value) => {},
  getTableDOM: (dom) => {},
  sortByColumn: (id, desc) => {}
};

const mockColumns = [
  {
    title: 'column1',
    id: 'column1',
    resizable: true,
    minWidth: 165,
    sortable: false,
    Cell: props => (
      <div>
        <span>{props.value.column1}</span>
      </div>)
  },
  {
    title: 'column2',
    id: 'column2',
    resizable: true,
    minWidth: 165,
    sortable: false,
    Cell: props => (
      <div>
        <span>{props.value.column2}</span>
      </div>)
  }
];

describe('[DataViewTable]mock data (7 items) test start...', () => {
  spy(DataViewTable.prototype, 'setColumnWidths');

  const wrapper = mount(
    <DataViewTable
      data={global.mockData}
      idKey="column1"
      initSelectedItems={[]}
      // onSelectChange={mockProps.onSelectChange}
      onRowClicked={(info) => {
        mockProps.onRowClicked(info);
      }}
      initialSort={[{ id: 'column1', desc: true }]}
      columns={mockColumns}
      getComponentDOM={mockProps.getTableDOM}
      noDataText={'mock text'}
      sortByColumn={(id, desc) => {
        mockProps.sortByColumn(id, desc);
      }}
    />,
    // this line will cause TypeError because of a bug of react below version 16
    { attachTo: global.document.getElementById('root') }
  );

  it('should not render the no product label', () => {
    expect(wrapper.find('.rt-noData').length).toBe(0);
    expect(wrapper.find('.rt-th').length).toBe(2);
  });

  it('should render the rows', () => {
    expect(wrapper.find('.rt-tr-group').length).toBe(7);
  });

  it('resize window', () => {
    // global.window.resizeTo(400, 1000);
    expect(DataViewTable.prototype.setColumnWidths.callCount).toBeGreaterThan(0);
    console.log(document.documentElement.outerHTML);
  })
});
