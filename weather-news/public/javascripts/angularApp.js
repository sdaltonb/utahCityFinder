angular.module('weatherNews', ['ui.router'])
.factory('postFactory', ['$http', function($http) {
  var o = {
    posts: [],
    post: {}
  };
  o.getAll = function() {
    return $http.get('/posts').success(function(data) {
      angular.copy(data, o.posts);
    });
  };
  o.create = function(post) {
    return $http.post('/posts', post).success(function(data) {
      o.posts.push(data);
    });
  };
  o.upvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote')
      .success(function(data) {
        post.upvotes += 1;
      });
  };
  o.getPost = function(id) {
    return $http.get('/posts/' + id).success(function(data) {
      angular.copy(data, o.post);
    });
  };
  o.addNewComment = function(id, comment) {
    return $http.post('/posts/' + id + '/comments', comment);
  };
  o.upvoteComment = function(selPost, comment) {
    return $http.put('/posts/' + selPost._id + '/comments/' + comment._id + '/upvote')
      .success(function(data) {
        comment.upvotes += 1;
      });
  };
  return o;
}])
.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/home',
        templateUrl: '/home.html',
        controller: 'MainCtrl'
      })
      .state('posts', {
        url: '/posts/{id}',
        templateUrl: '/posts.html',
        controller: 'PostCtrl'
      });
    $urlRouterProvider.otherwise('home');
}])
.controller('MainCtrl', [
  '$scope',
  'postFactory',
  function($scope, postFactory) {
    postFactory.getAll();
    $scope.posts = postFactory.posts;
    $scope.addPost = function() {
      if ($scope.formContent === '') {
        return;
      }
      postFactory.create( {
        title: $scope.formContent
      });
      $scope.formContent = '';
    };
    $scope.incrementUpvotes = function(post) {
      postFactory.upvote(post);
    };
  }
])
.controller('PostCtrl', [
  '$scope',
  '$stateParams',
  'postFactory',
  function($scope, $stateParams, postFactory) {
    var mypost = postFactory.posts[$stateParams.id];
    postFactory.getPost(mypost._id);
    $scope.post = postFactory.post;
    $scope.addComment = function() {
      if ($scope.body === '') {
        return;
      }
      postFactory.addNewComment(postFactory.post._id, {
        body: $scope.body
      }).success(function(comment) {
        mypost.comments.push(comment);
        postFactory.post.comments.push(comment);
      });
      $scope.body = '';
    };
  $scope.incrementUpvotes = function(comment) {
    console.log("incrementUp " + postFactory.post._id + " comment " + comment._id);
    postFactory.upvoteComment(postFactory.post, comment);
  };
}]);

