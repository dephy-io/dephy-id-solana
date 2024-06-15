CREATE MIGRATION m16hmfhcgsxehqt6kfgbb45zwaz3grmiw542n2uml36aug4dzrezya
    ONTO m1dpxkogxfvmuai6l4jp4mv727vip2ys7abenahh3r66bmsygjva4q
{
  ALTER TYPE default::Device {
      ALTER PROPERTY signing_alg {
          RESET OPTIONALITY;
      };
  };
};
