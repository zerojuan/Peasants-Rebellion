define('GameModel', [
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone){
	var GameModel;

	GameModel = Backbone.Model.extend({
		idAttribute : "id",
		urlRoot : "api/v1/game"
	});

	return GameModel;
});