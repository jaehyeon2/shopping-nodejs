const Sequelize=require('sequelize');

module.exports=class Basket extends Sequelzie.Model{
	static init(sequelize){
		return super.init({
			basketproduct:{
				type:Sequelize.STRING(50),
				allowNull:false,
			},
			ordercount:{
				type:Sequelize.INTEGER,
				allowNull:false,
			}
		},{
			sequelize,
			timestamps:true,
			underscored:false,
			modelName:'Basket',
			tableName:'baskets',
			charset:'utfmb4',
			collate:'utfmb4_general_ci',
		})
	}
}