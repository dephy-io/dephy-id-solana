CREATE MIGRATION m1v34vsai5arwfxj3dzypz3aafqmudqi2zc5yo66bbn5dzlju5dwoq
    ONTO m1xwtyi4pd2gurhxe5gd5ermj3il7bjl6jcjvd5qegycdvs6qjbmua
{
  CREATE SCALAR TYPE default::KeyType EXTENDING enum<Ed25519, Secp256k1>;
  ALTER TYPE default::Device {
      CREATE REQUIRED PROPERTY key_type: default::KeyType {
          SET REQUIRED USING (default::KeyType.Ed25519);
      };
  };
};
