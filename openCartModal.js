/* eslint-disable import/named */
/* eslint-disable import/extensions */
import React, { Component } from 'react';
import { PropTypes as T } from 'prop-types';
import RadioSelection from 'components/radio-selection';
import * as Modal from '../../../components/modal/index';
import PortalModal from '../../../components/modal-portal/modal';
import ModalButton from '../../../components/button';
import S from './modal-styles.less';
import { unloadModalComponent, changeCartForSelProduct, createNewLinkHandler }
  from '../services/catalog-search-page-service';

/**
  * SelectOpenCartModal Component
  */
class SelectOpenCartModal extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleAddToCart = this.handleAddToCart.bind(this);
    this.state = {
      searchStr: '',
      openCarts: this.props.attbrs.openCartsData.nextCartData,
      selectedCart: '',
      selectedCartName: '',
    };
  }

  onSearchTextChange(searchText) {
    this.setState({ searchStr: searchText });
    this.searchPO(searchText);
  }
  onRowClick(cart) {
    this.setState({ selectedCart: cart.code, selectedCartName: cart.name });
  }
  getContent() {
    return (<div className={S.accountSlectionModalContainer}>
        <div className={S.gridContainer}>
            {this.getRows()}
        </div>
      </div>);
  }

  getRows() {
    return _.map(this.state.openCarts, (cart, index) => {
      const updatedDate = moment(new Date(cart.lastModificationTime)).format('L');
      const updatedTime = new Date(cart.lastModificationTime).toLocaleTimeString();
      let dateTxt = updatedDate;
      const today = moment().format('L');
      const yesterday = moment(new Date()).add(-1, 'days').format('L');
      const entryTxt = cart.numberOfEntries > 1 ? ' PRODUCTS' : ' PRODUCT';
      let cartName = cart.name;
      if (updatedDate === today) {
        dateTxt = 'TODAY ';
      } else if (updatedDate === yesterday) {
        dateTxt = 'YESTERDAY ';
      }
      if (!cartName) {
        cartName = 'PO Number required';
      }
      return (<div>
          <div
            key={index}
            onKeyPress={() => {}}
            role="button"
            tabIndex="0"
            className={S.openCartTile}
            onClick={() => this.onRowClick(cart, index)}
          >
            <div className="col-md-8">
            <RadioSelection
              extraClasses={S.radioCls}
              value={`c${cart.code}`}
              labelNameText={cartName}
              checked={cart.code === this.state.selectedCart}
            />
            </div>
            <div className={`col-md-4 ${S.totalPrice}`}>
                ${cart.totalPrice.value}
            </div>
            <div>
                <div className="col-md-8">

                    <div className={`col-md-12 ${S.timeDiv}`}>
                        <span>{this.getCartType(cart)}</span>
                       <span>Last Modified: </span>
                       {dateTxt}, {updatedTime}
                    </div>
                </div>
                <div className={`col-md-4 ${S.numEntries}`}>
                    <span>{cart.numberOfEntries}{entryTxt}</span>
                </div>
            </div>
          </div>
          <div className={S.bottomBorder}> </div>
          </div>
      );
    });
  }
  getButton(cssStyle, callback, text, key, disable) {
    return (<ModalButton
      customClass={cssStyle}
      parentCallback={callback}
      textValue={text}
      key={key}
      disabled={disable}
    />);
  }

  getButtons() {
    const disable = this.state.selectedCart === '';
    const addBtnCls = disable ? S.disableBtn : S.addToSelCartBtn;
    const addToCartBtn = this.getButton(addBtnCls, this.handleAddToCart,
      'Add to Selected Cart', 'addtocartBtn', disable);
    const cancelBtn = this.getButton(S.cancelBtn, this.handleClose, 'Cancel', 'cancelBtn');
    return [cancelBtn, addToCartBtn];
  }
  getSubHeader() {
    return (<div className={S.subHeaderDiv}>
        <div className={S.totalTxt}><span>
            {this.props.attbrs.totalOpenCarts}</span> <span>Open Carts</span></div>
        <div
          onKeyPress={() => {}}
          role="button"
          tabIndex="0"
          className={S.newLink}
          onClick={() => createNewLinkHandler(this.props.product,
            this.props.attbrs.additionalAttributes)}
        >
          <span>CREATE NEW CART</span></div>
    </div>);
  }
  getCartType(cart) {
    let type = '';
    if (cart.isC2Cart) {
      type = <span className={S.ctwoIcon}><i> </i></span>;
    } else if (cart.isCsosCart) {
      type = <span className={S.csosIcon}><i> </i></span>;
    } else if (cart.isPssl) {
      type = <span className={S.psslIcon}><i> </i></span>;
    }
    return type;
  }
  handleAddToCart() {
    changeCartForSelProduct(this.state.selectedCart,
      this.props.product, this.state.selectedCartName,
      this.props.attbrs.additionalAttributes);
  }
  searchPO(searchText) {
    let carts = this.props.attbrs.openCartsData.nextCartData;
    let cartName = '';
    if (searchText && searchText !== null && searchText !== '') {
      carts = carts.filter((cart) => {
        cartName = cart.name;
        return ((cartName || 'PO Number required')
          .toLowerCase().indexOf((searchText || '').toLowerCase()) > -1);
      });
    }
    this.setState({ openCarts: carts });
  }
  handleClose() { unloadModalComponent(); }
  render() {
    const searchText = this.state.searchStr;
    return (
      <PortalModal size="medium" extraClasses={S.selectOpenCartModal}>
        <Modal.Header
          title="Select an Open Cart"
          titleClass="modalTitleText"
          close={this.handleClose}
        />
        <div className={S.additionalText}>
         {this.getSubHeader()}
        </div>
        <div className={S.searchBarContainer}>
          <div>
            <span className={S.searchIcon}> </span>
            <input
              type="text"
              value={searchText}
              onChange={(event) => this.onSearchTextChange(event.target.value)}
              placeholder="Search Carts..."
              className={S.cartSearch}
            />
          </div>
        </div>
        <Modal.Body additionalClassName={S.contentBody}>{this.getContent()}</Modal.Body>
        <Modal.Footer children={this.getButtons()} viewSpecificClass={S.footer}></Modal.Footer>
      </PortalModal>
    );
  }
}
SelectOpenCartModal.propTypes = {
  product: T.object.isRequired,
  attbrs: T.object.isRequired,
};

export default SelectOpenCartModal;
