module.exports = {
	description: 'Installs CSS animations as bower dependency',

	normalizeEntityName: function() {
		// this prevents an error when the entityName is
		// not specified (since that doesn't actually matter
		// to us
	},
	afterInstall: function() {
    return this.addBowerPackagesToProject([
     {name: 'animate.css', target: '3.4.0'},
     {name: 'babel-polyfill', target: '0.0.1'}
    ]);
	}
};
