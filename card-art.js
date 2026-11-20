const travelDecks = [
  ['鯨鯊 海龜',0],
  ['嘟嘟車 水上市場船 大象 金色佛塔',2],
  ['富士山 櫻花 飯糰 鮭魚壽司 鯉魚旗 三色糰子 抹茶 鳥居',6],
  ['彩陶罐 駱駝 埃及黑貓 椰棗樹 太陽 蠍子 眼鏡蛇 朱鷺 尼羅河帆船 紙莎草卷 青金石 聖甲蟲',14],
  ['艾菲爾鐵塔 可頌 法國長棍 起司 葡萄 調色盤 自行車 城堡 天鵝 可麗餅 鬱金香 咖啡 紅酒 小提琴 座鐘 石拱橋 帆船 山間松樹',26],
  ['自由女神 白頭海鵰 金門大橋 沙漠平頂山 野牛 松樹 雪山 黃色計程車 籃球 棒球 漢堡 熱狗 蘋果派 薩克斯風 吉他 摩天輪 火箭 棕熊 鹿 皮卡 紐約天際線 仙人掌 咖啡 自行車',42],
  ['珍珠奶茶 彈珠汽水 鳳梨酥 陀螺 糖果罐 茄芷袋 玩具水槍 牛奶冰棒 王子麵 乳酸飲料 草莓糖 麥芽糖 葡萄糖盒 玻璃牛奶瓶 彈珠 綠色棒棒糖 橘子冰棒 塑膠管冰 袋裝糖果 波浪鼓 火柴盒 摺紙星星 足球 魔術方塊 巧克力脆笛酥 懷舊鐵罐 杯子蛋糕 鹽袋 條紋桿 玩具機器人 布提袋 汽水瓶蓋',0]
];
const alternateTiles = {4:{16:22,17:47},5:{22:37,23:32}};

function makeCardArt(level, index) {
  const tile = document.createElement('span');
  tile.className = 'card-art';
  tile.setAttribute('aria-hidden', 'true');
  const taiwan = level === travelDecks.length - 1;
  const position = alternateTiles[level]?.[index] ?? travelDecks[level][1] + index;
  const atlas = taiwan ? 'taiwan' : 'travel';
  const image = level === 1 && index === 1
    ? 'scenes/thai-boat.png'
    : 'scenes/cards/' + atlas + '-' + position + '.png';
  tile.style.backgroundImage = 'url("' + image + '")';
  return tile;
}


