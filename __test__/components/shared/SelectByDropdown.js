import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class SelectByDropdown extends React.Component {
  constructor() {
    super();
    this.state = { showDropdown: false, filterText: '', dropdownPosition: {} };
    this.hideDropdown = this.hideDropdown.bind(this);
    this.closeDropdown = this.closeDropdown.bind(this);
    this.setDropdownPosition = this.setDropdownPosition.bind(this);
    this.showDropdown = this.showDropdown.bind(this);
    this.delayHideDropdown = this.delayHideDropdown.bind(this);
    this.cancelHideDropdown = this.cancelHideDropdown.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
  }

  componentDidMount() {
    document.addEventListener('click', this.closeDropdown);
    document.addEventListener('touchstart', this.closeDropdown);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.closeDropdown);
    document.removeEventListener('touchstart', this.closeDropdown);
    window.removeEventListener('resize', this.setDropdownPosition);
    window.removeEventListener('scroll', this.setDropdownPosition);
  }

  setDropdownPosition() {
    const togglePos = this.toggle.getBoundingClientRect();
    this.setState({
      dropdownPosition: {
        position: 'fixed',
        zIndex: 95,
        top: `${togglePos.bottom + 8}px`,
        left: this.props.align === 'right' ? `${togglePos.left}px` : `${togglePos.left + (Math.round(togglePos.width / 2) - 18)}px`,
        right: 'auto',
        transform: this.props.align === 'right' ? `translateX(-100%) translateX(${Math.round(togglePos.width / 2) + 18}px)` : 'none'
      }
    });
  }

  showDropdown() {
    if (this.props.beforeOpen) this.props.beforeOpen();
    this.setState({ showDropdown: true, filterText: '' });
    this.setDropdownPosition();
    //document.body.click();
    var event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    document.body.dispatchEvent(event);

    window.addEventListener('resize', this.setDropdownPosition);
    window.addEventListener('scroll', this.setDropdownPosition);
  }

  delayHideDropdown() {
    this.hideDropdownTimer = setTimeout(this.hideDropdown, 200);
  }

  cancelHideDropdown() {
    clearTimeout(this.hideDropdownTimer);
  }

  hideDropdown() {
    if (this.state.showDropdown) {
      this.setState({ showDropdown: false });
      if (this.props.afterClose) this.props.afterClose();
    }
    window.removeEventListener('resize', this.setDropdownPosition);
    window.removeEventListener('scroll', this.setDropdownPosition);
  }

  closeDropdown(e) {
    if (this.myself && !this.myself.contains(e.target)) this.hideDropdown();
  }

  toggleDropdown() {
    if (this.props.trigger === 'hover') return;
    return this.state.showDropdown ? this.hideDropdown() : this.showDropdown();
  }

  render() {
    const children = React.Children.toArray(this.props.children);
    const toggleEle = children.filter(c => c.props['data-role'] === 'toggle');
    const titleEle = children.filter(c => c.props['data-role'] === 'title');
    const dropdownEle = children.filter(c => c.props['data-role'] === 'dropdown');

    return (
      <div
        ref={(node) => { this.myself = node; }}
        className={classNames(
          'select-dropdown',
          this.props.className,
          { extend: this.state.showDropdown },
          { 'right-align': this.props.align === 'right' }
        )}
      >
        <div
          className="dropdown-toggle"
          ref={(node) => { this.toggle = node; }}
          onClick={this.toggleDropdown}
          onMouseEnter={this.props.trigger === 'click' ? null : this.showDropdown}
          onMouseLeave={this.props.trigger === 'click' ? null : this.delayHideDropdown}
        >
          {toggleEle}
        </div>
        { this.state.showDropdown &&
          <div
            className="dropdown"
            style={this.state.dropdownPosition}
            onMouseEnter={this.props.trigger === 'click' ? null : this.cancelHideDropdown}
            onMouseLeave={this.props.trigger === 'click' ? null : this.hideDropdown}
          >
            { titleEle.length > 0 && <div className="title">{titleEle}</div> }
            { this.props.searchable
                && <div className="search"><input type="text" onChange={e => this.setState({ filterText: e.target.value })} /></div>
            }
            <div onClick={() => this.hideDropdown()}>
              { this.props.searchable ?
                <ul>
                  { React.Children.toArray(dropdownEle[0].props.children)
                    .filter(d => (d.props['data-search-key'] === undefined ?
                      true : d.props['data-search-key'].toLowerCase().indexOf(this.state.filterText.toLowerCase()) > -1)
                    )
                  }
                </ul>
                : dropdownEle[0]
              }
            </div>
          </div>
        }
      </div>
    );
  }
}

SelectByDropdown.propTypes = {
  className: PropTypes.string,
  align: PropTypes.string,
  trigger: PropTypes.string,
  searchable: PropTypes.bool,
  beforeOpen: PropTypes.func,
  afterClose: PropTypes.func,
  children: PropTypes.arrayOf(PropTypes.element).isRequired
};

SelectByDropdown.defaultProps = {
  className: '',
  align: 'left',
  trigger: 'hover',
  searchable: false,
  beforeOpen: undefined,
  afterClose: undefined
};

export default SelectByDropdown;
