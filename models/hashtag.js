const Sequelize=require('sequelize');

module.exports=class Hashtag extends Sequelize.Model{
	static init(sequelize){
		return super.init({
			title:{
				type:Sequelize.STRING(50),
				allowNull:false,
				unique:true,
			},
		},{
			sequelize,
			timestamps:true,
			modelName:'Hashtag',
			tableName:'hashtags',
			charset:'utf8mb4',
			collate:'utf8mb4_general_ci',
		})
	}
};