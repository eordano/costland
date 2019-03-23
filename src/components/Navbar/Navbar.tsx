import * as React from 'react'

import { Blockie, Mana, Logo, Header, Container, Menu, Responsive, MenuItem } from 'decentraland-ui'

import './Navbar.css'

export type NavbarI18N = {
  menu: {
    marketplace: React.ReactNode
    docs: React.ReactNode
    agora: React.ReactNode
    blog: React.ReactNode
    builder: React.ReactNode
  }
  account: {
    signIn: React.ReactNode
    connecting: React.ReactNode
  }
}

export type NavbarProps = {
  mana?: number
  address?: string
  activePage?: 'marketplace' | 'docs' | 'agora' | 'blog' | 'builder'
  menuItems?: React.ReactNode
  i18n?: NavbarI18N
  isConnected?: boolean
  isConnecting?: boolean
  isSignIn?: boolean
  isFullscreen?: boolean
  onSignIn?: () => void
  onClickAccount?: () => void
}

export type NavbarState = {
  toggle: boolean
}

export default class CustomNavbar extends React.PureComponent<NavbarProps, NavbarState> {
  static defaultProps: Partial<NavbarProps> = {
    mana: undefined,
    address: undefined,
    activePage: undefined,
    menuItems: null,
    i18n: {
      menu: {
        marketplace: 'Marketplace',
        docs: 'Docs',
        agora: 'Agora',
        blog: 'Blog',
        builder: 'Builder'
      },
      account: {
        signIn: 'Sign In',
        connecting: 'Connecting...'
      }
    },
    isConnected: false,
    isConnecting: false,
    isFullscreen: false,
    isSignIn: false,
    onSignIn: undefined,
    onClickAccount: undefined
  }
  public state = {
    toggle: false
  }
  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick)
  }
  handleToggle = (event: any) => {
    this.setState({ toggle: !this.state.toggle })
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()
  }
  handleDocumentClick = () => {
    this.setState({ toggle: false })
  }

  render() {
    const {
      mana,
      address,
      activePage,
      i18n,
      menuItems,
      isConnected,
      isConnecting,
      isSignIn,
      isFullscreen,
      onSignIn,
      onClickAccount
    } = this.props

    let classes = `dcl navbar`

    if (this.state.toggle) {
      classes += ' open'
    }
    if (isSignIn) {
      classes += ' sign-in'
    }
    if (isFullscreen) {
      classes += ' fullscreen'
    }

    return (
      <div className={classes} role="navigation">
        <Container>
          <div className="dcl navbar-menu">
            <Responsive
              as={Menu}
              secondary
              stackable
              minWidth={Responsive.onlyTablet.minWidth}
            >
              <a className="dcl navbar-logo" href="https://decentraland.org">
                <Logo />
              </a>
              <MenuItem>CryptoValley</MenuItem>
            </Responsive>
            <Responsive
              {...Responsive.onlyMobile}
              className="dcl navbar-mobile-menu"
            >
              <a className="dcl navbar-logo" href="https://decentraland.org">
                <Logo />
              </a>
              <Header
                size="small"
                className={`dcl active-page ${
                  this.state.toggle ? 'caret-up' : 'caret-down'
                }`}
                onClick={this.handleToggle}
              >
                {activePage}
              </Header>
            </Responsive>
          </div>

          <div className="dcl navbar-account">
            {isConnected ? (
              <>
                {menuItems ? (
                  <Responsive
                    as={Menu}
                    secondary
                    className="dcl navbar-account-menu"
                    minWidth={Responsive.onlyTablet.minWidth}
                  >
                    {menuItems}
                  </Responsive>
                ) : null}
                <span
                  className={`dcl account-wrapper ${
                    onClickAccount ? 'clickable' : ''
                  }`}
                  onClick={onClickAccount}
                >
                  {mana != null ? (
                    <Mana size="small" title={`${mana.toLocaleString()} MANA`}>
                      {mana.toLocaleString()}
                    </Mana>
                  ) : null}
                  {address != null ? <Blockie seed={address} /> : null}
                </span>
              </>
            ) : isConnecting && !isSignIn ? (
              <Menu secondary>
                <Menu.Item disabled>Connecting...</Menu.Item>
              </Menu>
            ) : onSignIn || isSignIn ? (
              <Menu secondary>
                <Menu.Item className="sign-in-button" onClick={onSignIn}>
                  SignIn
                </Menu.Item>
              </Menu>
            ) : null }
          </div>
        </Container>
        <div className="mobile-menu"></div>
      </div>
    )
  }
}