define('GameModel', [
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone){
	var GameModel;

	GameModel = Backbone.Model.extend({
		idAttribute : "code",
		urlRoot : "api/v1/game"
	});

	return GameModel;
});