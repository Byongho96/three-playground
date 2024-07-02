// function attachHair(){
//   loader.load(’/public/makeavatar/data/hair/Base_Hair_05.glb’, function (hair_gltf) {
//   var hair = hair_gltf.scene;
//   hair.name = “Avatar_Hair”;
//   hair.scale.set(2, 2, 2);
//   hair.position.set(0, -2.5, 0);
//   let Avatar_base;
//   let bone;
//   let $bindMatrix = new Matrix4();
//   let $bindMatrixInverse = new Matrix4();
//   let $skeleton = new Skeleton();
//   avatar.traverse(function (element) {
//   if (element.name == “Avatar_base”){Avatar_base = element;}
//   if (element.name == “Base_Eyes”){console.log(‘eyes’);
//   $bindMatrix = element.bindMatrix;
//   $bindMatrixInverse = element.bindMatrixInverse;
//   $skeleton = element.skeleton;
//   }
//   if (element.name == “Base_Body”){ // Head is a bone
//   hair.traverse(function (bits) {
//   if(bits.name == “Base_Hair”){
//   //SceneUtils.attach 5( bits, avatar, Avatar_base); // attach to head works
//   bits.scale.set(2, 2, 2);
//   bits.position.set(0, -2.5, 0);
//   Avatar_base.add(bits);
//   //element.updateMatrixWorld 1(true);
//   bits.skeleton = $skeleton;
//   //bits.bind($skeleton, $bindMatrix);
//   bits.bindMatrix = $bindMatrix;
//   bits.bindMatrixInverse = $bindMatrixInverse;
//   bits.bindMode = ‘attached’;
//   bits.type = ‘SkinnedMesh’;
//   bits.visible = true;
//   //bits.updateMatrixWorld 1(true);
//   }
//   });
//   //SceneUtils.attach 5( hair, avatar, element);
//   scene.needsUpdate = true;
//   }
//   });
