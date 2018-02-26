/*
  This is a customized wrapper for React-Table.
  This component's functionalities are based on current requirements
*/
import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import _ from 'lodash';

export default class DataViewTable extends React.Component {
  constructor(props) {
    super(props);
    this.idKey = props.idKey;
    this.hasCheckbox = Boolean(props.onSelectChange);
    this.columnTooltips = {};

    this.state = {
      partialSelection: false,
      selectedList: _.cloneDeep(props.initSelectedItems),
      tooltip: props.columns.filter(item => item.sortable)
        .map(item => ({
          id: item.id,
          tooltip: item.sortTooltip.asc
        })),
      columnWidths: [],
      currentSort: _.cloneDeep(props.initialSort),
      displayedColumns: this.createColumns(props)
    };

    this.resizeColumns = this.resizeColumns.bind(this);
    this.windowResizeHandler = this.windowResizeHandler.bind(this);
    this.sortChangeHandler = this.sortChangeHandler.bind(this);
    this.tdPropsHandler = this.tdPropsHandler.bind(this);
    this.selectAllHandler = this.selectAllHandler.bind(this);
    this.itemCheckChangeHandler = this.itemCheckChangeHandler.bind(this);
  }

  componentDidMount() {
    if (this.props.getComponentDOM) {
      this.props.getComponentDOM(this.rtDOM);
    }
    this.setColumnWidths(this.state.displayedColumns, $(this.rtDOM).width(), this.props.hideColumnSequence);
    $(window).resize(this.windowResizeHandler);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      currentSort: nextProps.initialSort
    });
  }

  componentWillUnmount() {
    $(window).off('resize', this.windowResizeHandler);
  }

  setColumnWidths(cols, availableWidth, hideSeq) {
    const columnWidths = [];
    let totalColumnFixedWidth = 0;
    let totalColumnResizableWidth = 0;
    const tempColumns = _.cloneDeep(cols);
    tempColumns.forEach((item) => {
      item.show = true;
      if (item.resizable) {
        totalColumnResizableWidth += item.minWidth;
      } else {
        totalColumnFixedWidth += item.width;
      }
    });
    const hideSequence = _.cloneDeep(hideSeq);
    if (availableWidth < totalColumnFixedWidth + totalColumnResizableWidth) {
      while (hideSequence.length > 0) {
        const tempHide = _.find(tempColumns, { id: hideSequence.shift() });
        if (tempHide.resizable) {
          totalColumnResizableWidth -= tempHide.minWidth;
        } else {
          totalColumnFixedWidth -= tempHide.width;
        }
        tempHide.show = false;
        if (availableWidth > totalColumnFixedWidth + totalColumnResizableWidth) {
          break;
        }
      }
    }

    tempColumns.forEach((item) => {
      if (item.show) {
        columnWidths.push({
          id: item.id,
          value: item.resizable ? (item.minWidth * (availableWidth - totalColumnFixedWidth)) / totalColumnResizableWidth : item.width
        });
      }
    });
    this.setState({
      columnWidths,
      displayedColumns: tempColumns
    });
    console.log($('#root').width());
    console.log($(this.rtDOM).width());
    console.log($('.cdm-DVT').width());
    console.log(columnWidths);
    return columnWidths;
  }

  windowResizeHandler(event, params) {
    if (params !== 'noColumnWidthReset') {
      this.setColumnWidths(this.state.displayedColumns, $(this.rtDOM).width(), this.props.hideColumnSequence);
    }
  }

  resizeColumns(newResized) {
    const resizedColumnWidths = _.cloneDeep(this.state.columnWidths);
    for (let i = 0; i < resizedColumnWidths.length; i += 1) {
      for (let j = 0; j < newResized.length; j += 1) {
        if (newResized[j].id === resizedColumnWidths[i].id && newResized[j].value !== resizedColumnWidths[i].value) {
          const leftColumnMinWidth = _.find(this.state.displayedColumns, { id: resizedColumnWidths[i].id }).minWidth;
          if (i === resizedColumnWidths.length - 1) {
            resizedColumnWidths[i].value = newResized[j].value > leftColumnMinWidth ? newResized[j].value : leftColumnMinWidth;
          } else {
            const affectedWidth = resizedColumnWidths[i].value + resizedColumnWidths[i + 1].value;
            const rightColumnMinWidth = _.find(this.state.displayedColumns, { id: resizedColumnWidths[i + 1].id }).minWidth;
            if (newResized[j].value > leftColumnMinWidth) {
              if (affectedWidth - newResized[j].value > rightColumnMinWidth) {
                resizedColumnWidths[i].value = newResized[j].value;
                resizedColumnWidths[i + 1].value = affectedWidth - newResized[j].value;
              } else {
                resizedColumnWidths[i].value = affectedWidth - rightColumnMinWidth;
                resizedColumnWidths[i + 1].value = rightColumnMinWidth;
              }
            } else {
              resizedColumnWidths[i].value = leftColumnMinWidth;
              resizedColumnWidths[i + 1].value = affectedWidth - leftColumnMinWidth;
            }
          }
          this.setState({ columnWidths: resizedColumnWidths });
          $(window).trigger('resize', ['noColumnWidthReset']);
          return;
        }
      }
    }
  }

  selectAllHandler() {
    let tempSelected;
    if (this.state.selectedList.length === this.props.data.length) {
      tempSelected = [];
    } else {
      tempSelected = this.props.data.map(item => item[this.idKey]);
    }
    this.setState({
      selectedList: tempSelected,
      partialSelection: false
    });
    this.props.onSelectChange(tempSelected);
  }

  itemCheckChangeHandler(id) {
    let result;
    if (this.state.selectedList.indexOf(id) !== -1) {
      result = _.without(this.state.selectedList, id);
    } else {
      result = this.state.selectedList.concat(id);
    }
    this.setState({
      selectedList: result,
      partialSelection: result.length < this.props.data.length && result.length > 0
    });
    this.props.onSelectChange(result);
  }

  createColumns(props) {
    const columnsArr = props.columns.map((item) => {
      if (item.sortable) {
        this.columnTooltips[`${item.id}false`] = item.sortTooltip.asc;
        this.columnTooltips[`${item.id}true`] = item.sortTooltip.desc;
      }
      return {
        Header: () => (<div className="header-content">{item.title}</div>),
        accessor: '',
        id: item.id,
        resizable: item.resizable,
        width: item.width,
        minWidth: item.minWidth,
        show: true,
        sortable: item.sortable,
        Cell: item.Cell
      };
    });

    if (this.hasCheckbox) {
      columnsArr.unshift({
        Header: () => (
          <label
            htmlFor="checkboxInput"
            className={
              this.state.partialSelection ? ('co-checkbox partial-checked') : 'co-checkbox'
            }
          >
            <input
              id="checkboxInput"
              type="checkbox"
              onChange={this.selectAllHandler}
              checked={this.state.selectedList.length === this.props.data.length}
            />
            <span />
          </label>),
        accessor: '',
        id: 'checkbox',
        resizable: false,
        width: 33,
        sortable: false,
        Cell: rowInfo => (
          <label htmlFor={rowInfo.value[this.idKey]} className="co-checkbox">
            <input
              id={rowInfo.value[this.idKey]}
              type="checkbox"
              onChange={() => this.itemCheckChangeHandler(rowInfo.value[this.idKey])}
              checked={this.state.selectedList.indexOf(rowInfo.value[this.idKey]) >= 0}
            />
            <span />
          </label>
        )
      });
    }
    return columnsArr;
  }

  sortChangeHandler(newSorted, column, shiftKey) {
    const newToolTip = _.clone(this.state.tooltip);
    if (_.find(this.state.tooltip, { id: column.id }) && this.props.sortByColumn) {
      const tempSort = _.cloneDeep(this.state.currentSort);
      if (column.id === tempSort[0].id) {
        tempSort[0].desc = !tempSort[0].desc;
      } else {
        tempSort[0].id = column.id;
        tempSort[0].desc = false;
      }
      _.find(newToolTip, { id: column.id }).tooltip = this.columnTooltips[`${tempSort[0].id}${tempSort[0].desc}`];
      this.props.sortByColumn(tempSort[0].id, tempSort[0].desc);
      this.setState({
        selectedList: [],
        partialSelection: false,
        tooltip: newToolTip,
        currentSort: tempSort
      });
    }
  }

  tdPropsHandler(state, rowInfo, column, instance) {
    return {
      onClick: () => {
        if (column.id !== 'checkbox' && this.props.onRowClicked) {
          this.props.onRowClicked(rowInfo.original);
        }
      }
    };
  }

  render() {
    var divStyle = {
      color: 'white',
      width: '100%',
      display: 'block'
    };

    return (
      <div className="cdm-DVT" style={divStyle} ref={(dom) => { this.rtDOM = dom; }}>
        <ReactTable
          style={divStyle}
          className="-highlight"
          noDataText={this.props.noDataText}
          data={this.props.data}
          columns={this.state.displayedColumns}
          loading={this.props.loading}
          showPagination={false}
          minRows={0}
          sorted={this.state.currentSort}
          resized={this.state.columnWidths}
          onSortedChange={this.sortChangeHandler}
          getTdProps={this.tdPropsHandler}
          onResizedChange={this.resizeColumns}
          manual
        />
      </div>
    );
  }
}

DataViewTable.propTypes = {
  loading: PropTypes.bool,
  data: PropTypes.arrayOf(PropTypes.object),
  idKey: PropTypes.string,
  onSelectChange: PropTypes.func,
  onRowClicked: PropTypes.func,
  columns: PropTypes.arrayOf(PropTypes.object),
  getComponentDOM: PropTypes.func,
  noDataText: PropTypes.string,
  initialSort: PropTypes.arrayOf(PropTypes.object),
  sortByColumn: PropTypes.func,
  initSelectedItems: PropTypes.arrayOf(PropTypes.string),
  hideColumnSequence: PropTypes.arrayOf(PropTypes.string)
};

DataViewTable.defaultProps = {
  loading: false,
  data: [],
  idKey: '',
  onSelectChange: undefined,
  onRowClicked: undefined,
  columns: [],
  getComponentDOM: () => {},
  noDataText: '',
  initialSort: undefined,
  sortByColumn: undefined,
  initSelectedItems: [],
  hideColumnSequence: []
};
