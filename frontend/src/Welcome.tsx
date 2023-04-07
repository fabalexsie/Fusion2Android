import { Accordion, Anchor, Container, List, Text, Title } from '@mantine/core';
import { Prism } from '@mantine/prism';

const pythonShrinkUsd = `stage = Usd.Stage.Open(input_path)
default_prim = stage.GetDefaultPrim()
xformCommonAPI = UsdGeom.XformCommonAPI(default_prim)
xform = UsdGeom.Xformable(default_prim)

# handle transform opertations
for op in xform.GetOrderedXformOps():
    if op.GetName() == 'xformOp:transform':        
        (transl, rotate, scale, pivot, rotOrder) = xformCommonAPI.GetXformVectors(Usd.TimeCode.Default())
        xform.ClearXformOpOrder()
        xformCommonAPI.SetXformVectors(transl, rotate, scale, pivot, rotOrder, Usd.TimeCode.Default())

# shrink model because google ar core show one unit as 1 meter, but fusion 360 shows one unit as 1 millimeter
xformCommonAPI.SetScale((0.001, 0.001, 0.001))
stage.Export(input_path)`;

export function Welcome() {
  return (
    <Container>
      <Title order={1} mb="md">
        Welcome to{' '}
        <Text span c="#ff6b00" inherit>
          F
        </Text>
        usion2Android!
      </Title>
      <Text>
        Here you can upload your export from Fusion 360 to get an openable link
        for your Android phone.
      </Text>

      <Title order={2} my="md">
        How to use
      </Title>
      <Text>
        <List type="ordered">
          <List.Item>Export your Fusion 360 project as a .usdz file.</List.Item>
          <List.Item>
            Create a new project folder on this site.
            <Text c="dimmed">
              Each project folder has a unique ID and a password to protect it
              from unauthorized uploads. Also, each project folder can contain
              multiple models.
            </Text>
          </List.Item>
          <List.Item>
            After entering your password on your project page you can upload
            your .usdz file.
          </List.Item>
          <List.Item>
            You will see a preview of your model with a link to open it on an
            android phone.
            <Text c="dimmed">
              You will need to have{' '}
              <Anchor href="https://play.google.com/store/apps/details?id=com.google.ar.core">
                AR Core
              </Anchor>{' '}
              installed on your smartphone.
            </Text>
          </List.Item>
          <List.Item>
            Share your project ID with your friends so they can view your
            creation themselves.
          </List.Item>
        </List>
      </Text>

      <Title order={2} my="md">
        How does it work?
      </Title>

      <Accordion variant="contained" mt="md">
        <Accordion.Item value="view-res">
          <Accordion.Control>View the result on the phone</Accordion.Control>
          <Accordion.Panel>
            <Text>
              The google app for android provides a scene viewer that can open
              gltf files and shows them on AR Core enabled devices. (
              <Anchor
                href="https://developers.google.com/ar/develop/scene-viewer#3d-or-ar"
                target="_blank"
              >
                Reference
              </Anchor>
              ) It also supports viewing the model as AR in the real world. All
              you have to do is providing the model via a specific link, which
              starts the google app and opens the scene viewer. For this to work
              the model needs to be in the .gltf format.
            </Text>
            <Text>
              Example from the google documentation:
              <Prism language="jsx">
                {`<a href="intent://arvr.google.com/scene-viewer/1.0?file=https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF/Avocado.gltf#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;">Avocado</a>`}
              </Prism>
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="conversion">
          <Accordion.Control>Conversion of .usdz to .gltf</Accordion.Control>
          <Accordion.Panel>
            So for this to work we need to convert the .usdz file to .gltf.
            Thanks to{' '}
            <Anchor href="https://github.com/mikelyndon">mikelyndon</Anchor>'s
            python package{' '}
            <Anchor href="https://pypi.org/project/usd2gltf/">usd2gltf</Anchor>{' '}
            we can do this very easily. Although there occur some other
            problems:
            <Accordion variant="contained" mt="md">
              <Accordion.Item value="problem-size">
                <Accordion.Control>Problem with the size</Accordion.Control>
                <Accordion.Panel>
                  After the first conversion I realised the problem, that Fusion
                  360 exports 1 mm as 1 unit in the gltf. On the other hand
                  google imports 1 unit as 1 m. This showed up when viewing the
                  model with AR in the real world. So I scaled the usd model
                  down by 1000 and then converted it to gltf.
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="problem-export">
                <Accordion.Control>
                  Problem with the fusion export
                </Accordion.Control>
                <Accordion.Panel>
                  This result again in an error because the fusion export
                  partially exported transformation on an object as matrix
                  transformation, which can not be combined with manual scaling.
                  To solve this I had to convert the matrix transformation to
                  translation, rotation and scale. After that I could apply the
                  scale factor.
                  <Prism language="python" mt="md">
                    {pythonShrinkUsd}
                  </Prism>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}
