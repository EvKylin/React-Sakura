/**
 * Created by QiHan Wang on 2017/12/25.
 * E-Mail: whenhan@foxmail.com
 * File Name: BasicLayout
 */


import React from 'react';
import PropTypes from 'prop-types';
import {Layout, Icon} from 'antd';
import DocumentTitle from 'react-document-title';
import {connect} from 'react-redux';
import {Route, Redirect, Switch} from 'react-router-dom';
import {ContainerQuery} from 'react-container-query';
import classNames from 'classnames';
import GlobalHeader from '../components/GlobalHeader';
import GlobalFooter from '../components/GlobalFooter';
import SiderMenu from '../components/SiderMenu';
import NotFound from '../views/Exception/404';

const {Content} = Layout;

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

class BasicLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };

  getChildContext() {
    const {location, navData, getRouteData} = this.props;
    const routeData = getRouteData('BasicLayout');
    const firstMenuData = navData.reduce((arr, current) => arr.concat(current.children), []);
    const menuData = this.getMenuData(firstMenuData, '');
    const breadcrumbNameMap = {};

    routeData.concat(menuData).forEach((item) => {
      breadcrumbNameMap[item.path] = {
        name: item.name,
        component: item.component,
      };
    });
    return {location, breadcrumbNameMap};
  }

  getPageTitle() {
    const {location, getRouteData} = this.props;
    const {pathname} = location;
    let title = 'Sakura UI';
    getRouteData('BasicLayout').forEach((item) => {
      if (item.path === pathname) {
        title = `${item.name} - Sakura UI`;
      }
    });
    return title;
  }

  getMenuData = (data, parentPath) => {
    let arr = [];
    data.forEach((item) => {
      if (item.children) {
        arr.push({path: `${parentPath}/${item.path}`, name: item.name});
        arr = arr.concat(this.getMenuData(item.children, `${parentPath}/${item.path}`));
      }
    });
    return arr;
  };

  render() {
    const {
      currentUser, collapsed, fetchingNotices, notices, getRouteData, navData, location, dispatch,
    } = this.props;

    console.log(currentUser.token)

    const layout = (
      <Layout>
        <SiderMenu
          collapsed={collapsed}
          navData={navData}
          location={location}
          dispatch={dispatch}
        />
        <Layout>
          <GlobalHeader
            currentUser={currentUser}
            fetchingNotices={fetchingNotices}
            notices={notices}
            collapsed={collapsed}
            dispatch={dispatch}
          />
          <Content style={{margin: '24px 24px 0', height: '100%'}}>
            <div style={{minHeight: 'calc(100vh - 260px)'}}>
              <Switch>
                {
                  getRouteData('BasicLayout').map(item =>
                    (
                      <Route
                        exact={item.exact}
                        key={item.path}
                        path={item.path}
                        component={item.component}
                      />
                    )
                  )
                }
                <Redirect exact from="/" to="/dashboard/analysis"/>
                <Route component={NotFound}/>
              </Switch>
            </div>
            <GlobalFooter
              links={[{
                title: 'GitHub',
                href: 'https://github.com/ant-design/ant-design-pro',
                blankTarget: true,
              }, {
                title: 'Ant Design',
                href: 'http://ant.design',
                blankTarget: true,
              }]}
              copyright={<div>Copyright <Icon type="copyright"/> 2017 蚂蚁金服体验技术部出品</div>}
            />
          </Content>
        </Layout>
      </Layout>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => <div className={classNames(params)}>
            {!currentUser.token ? layout : (<Redirect to="/user/login"/>)}
          </div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}

//export default BasicLayout;
export default connect(state => ({
  currentUser: state.user.currentUser,
  collapsed: state.global.collapsed,
  fetchingNotices: state.global.fetchingNotices,
  //notices: state.global.notices,
}))(BasicLayout);
