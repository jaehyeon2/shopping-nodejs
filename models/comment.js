const Sequelize=require('sequelize');

module.exports=class buy extends Sequelize.Model{
	static init(sequelize){
		return super.init({
			rating:{
				type:Sequelize.INTEGER,
				allowNull:false,
			},
			content:{
				type:Sequelize.STRING(500),
				allowNull:false,
			}
		},{
			sequelize,
			timestamps:true,
			underscored:false,
			modelName:'Comment',
			tableName:'comments',
			charset:'utf8',
			collate:'utf8_general_ci',
		})
	}
}