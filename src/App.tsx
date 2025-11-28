import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Empty,
  Input,
  Layout,
  List,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import {
  DatabaseOutlined,
  FilterOutlined,
  SearchOutlined,
  SettingOutlined,
  DisconnectOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import type { CheckboxValueType } from 'antd/es/checkbox/Group'
import type { AppInfo } from '@/shared/ipc/types'

import './App.css'

const { Header, Content, Sider } = Layout
const { Title, Text, Paragraph } = Typography

interface AssetRecord {
  id: string
  name: string
  type: 'image' | 'audio' | 'model' | 'script'
  library: string
  size: number
  updatedAt: string
  tags: string[]
  status: 'online' | 'offline'
  path: string
  description: string
}

const typeOptions = [
  { label: '图像', value: 'image' },
  { label: '音频', value: 'audio' },
  { label: '3D 模型', value: 'model' },
  { label: '脚本/插件', value: 'script' },
]

const libraryOptions = [
  { label: 'ArtStation (SSD)', value: 'art-ssd' },
  { label: 'Audio Vault (NAS)', value: 'audio-nas' },
  { label: 'Prototype Pack (USB)', value: 'prototype-usb' },
]

const tagOptions = ['角色', '环境', 'UI', '音效', '交互', '粒子']

const assets: AssetRecord[] = [
  {
    id: 'asset-1',
    name: 'Hero_Knight_Idle',
    type: 'image',
    library: 'art-ssd',
    size: 25_165_824,
    updatedAt: '2024-12-18 13:20',
    tags: ['角色', 'UI'],
    status: 'online',
    path: 'ArtStation/Characters/Hero_Knight_Idle.png',
    description: '英雄骑士立绘，适用于登陆界面与角色卡片展示。',
  },
  {
    id: 'asset-2',
    name: 'Forest_Amb_Loop',
    type: 'audio',
    library: 'audio-nas',
    size: 48_640_000,
    updatedAt: '2024-12-10 09:05',
    tags: ['环境', '音效'],
    status: 'online',
    path: 'Audio Vault/Ambience/Forest_Amb_Loop.wav',
    description: '森林环境循环音效，提供自然氛围与远景鸟鸣。',
  },
  {
    id: 'asset-3',
    name: 'Modular_SciFi_Door',
    type: 'model',
    library: 'prototype-usb',
    size: 128_000_000,
    updatedAt: '2024-11-29 17:42',
    tags: ['交互'],
    status: 'offline',
    path: 'Prototype Pack/Props/Modular_SciFi_Door.glb',
    description: '模块化科幻门模型，包含动画骨骼与可替换材质。',
  },
  {
    id: 'asset-4',
    name: 'Inventory_Highlight',
    type: 'script',
    library: 'art-ssd',
    size: 512_000,
    updatedAt: '2024-12-02 20:10',
    tags: ['UI'],
    status: 'online',
    path: 'ArtStation/Scripts/Inventory_Highlight.ts',
    description: 'React + Three.js UI 高亮脚本，可用于展示选中物体。',
  },
]

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const size = bytes / 1024 ** exponent
  return `${size.toFixed(size >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<CheckboxValueType[]>([])
  const [selectedLibraries, setSelectedLibraries] = useState<CheckboxValueType[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(assets[0]?.id ?? null)
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)

  useEffect(() => {
    let mounted = true
    window.dam2Ipc
      ?.invoke('app:get-info', {})
      .then((info) => {
        if (mounted) {
          setAppInfo(info)
        }
      })
      .catch((error) => {
        console.error('[IPC] 获取应用信息失败', error)
      })
    return () => {
      mounted = false
    }
  }, [])

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = searchTerm
        ? asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        : true

      const matchesType = selectedTypes.length ? selectedTypes.includes(asset.type) : true
      const matchesLibrary = selectedLibraries.length ? selectedLibraries.includes(asset.library) : true
      const matchesTags =
        selectedTags.length === 0 || selectedTags.every((tag) => asset.tags.includes(tag))

      return matchesSearch && matchesType && matchesLibrary && matchesTags
    })
  }, [searchTerm, selectedTypes, selectedLibraries, selectedTags])

  const selectedAsset = filteredAssets.find((asset) => asset.id === selectedAssetId) ?? filteredAssets[0] ?? null

  useEffect(() => {
    if (selectedAsset) {
      setSelectedAssetId(selectedAsset.id)
    } else {
      setSelectedAssetId(null)
    }
  }, [selectedAsset])

  return (
    <Layout className='app-shell'>
      <Header className='app-header'>
        <div className='app-header-search'>
          <Input
            size='large'
            prefix={<SearchOutlined />}
            placeholder='搜索资产名称、标签或关键字（支持模糊匹配）'
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            allowClear
          />
        </div>
        <Space className='app-header-actions' size='middle'>
          <Tooltip title='筛选条件面板'>
            <Button icon={<FilterOutlined />} type='default'>
              筛选
            </Button>
          </Tooltip>
          <Tooltip title='打开设置'>
            <Button icon={<SettingOutlined />} type='default' />
          </Tooltip>
          {appInfo ? (
            <Text type='secondary' className='app-version'>
              {appInfo.name} v{appInfo.version}
            </Text>
          ) : null}
        </Space>
      </Header>
      <Layout className='app-body'>
        <Sider width={260} className='filters-panel'>
          <div className='filters-section'>
            <Title level={5}>资产类型</Title>
            <Checkbox.Group
              className='filters-section__content'
              options={typeOptions}
              value={selectedTypes}
              onChange={setSelectedTypes}
            />
          </div>
          <Divider />
          <div className='filters-section'>
            <Title level={5}>资源库</Title>
            <Checkbox.Group
              className='filters-section__content'
              options={libraryOptions.map((item) => ({
                label: (
                  <Space size={8}>
                    <DatabaseOutlined />
                    <span>{item.label}</span>
                  </Space>
                ),
                value: item.value,
              }))}
              value={selectedLibraries}
              onChange={setSelectedLibraries}
            />
            <Paragraph type='secondary' className='filters-section__hint'>
              离线库将保留索引但暂不可预览。
            </Paragraph>
          </div>
          <Divider />
          <div className='filters-section'>
            <Title level={5}>常用标签</Title>
            <Space size={[8, 8]} wrap className='tag-cloud'>
              {tagOptions.map((tag) => (
                <Tag.CheckableTag
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onChange={(checked) => {
                    setSelectedTags((prev) =>
                      checked ? [...prev, tag] : prev.filter((item) => item !== tag),
                    )
                  }}
                >
                  {tag}
                </Tag.CheckableTag>
              ))}
            </Space>
          </div>
        </Sider>
        <Content className='results-area'>
          <div className='results-summary'>
            <div>
              <Title level={4} className='results-title'>搜索结果</Title>
              <Text type='secondary'>匹配到 {filteredAssets.length} 条资产</Text>
            </div>
            <Space size='small'>
              <Tag icon={<InboxOutlined />} color='default'>
                未生成 AI 标签
              </Tag>
              <Tag color='blue'>支持无限滚动</Tag>
            </Space>
          </div>
          <Card className='results-card' bodyStyle={{ padding: 0 }}>
            {filteredAssets.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description='暂无匹配资产，请调整搜索或筛选条件'
              />
            ) : (
              <List
                dataSource={filteredAssets}
                renderItem={(item) => {
                  const isSelected = item.id === selectedAssetId
                  return (
                    <List.Item
                      key={item.id}
                      className={`asset-list-item ${isSelected ? 'asset-list-item--selected' : ''}`}
                      onClick={() => setSelectedAssetId(item.id)}
                    >
                      <List.Item.Meta
                        title={
                          <Space size='small'>
                            <Text strong>{item.name}</Text>
                            {item.status === 'offline' ? (
                              <Tag color='red' icon={<DisconnectOutlined />}>离线</Tag>
                            ) : null}
                          </Space>
                        }
                        description={
                          <Space size={[12, 4]} wrap>
                            <Text type='secondary'>类型：{typeOptions.find((type) => type.value === item.type)?.label}</Text>
                            <Text type='secondary'>库：{libraryOptions.find((library) => library.value === item.library)?.label}</Text>
                            <Text type='secondary'>大小：{formatFileSize(item.size)}</Text>
                            <Text type='secondary'>更新：{item.updatedAt}</Text>
                          </Space>
                        }
                      />
                      <Space size={[8, 8]} wrap>
                        {item.tags.map((tag) => (
                          <Tag key={tag} color='blue'>
                            {tag}
                          </Tag>
                        ))}
                      </Space>
                    </List.Item>
                  )
                }}
              />
            )}
          </Card>
        </Content>
        <Sider width={320} className='detail-panel'>
          {selectedAsset ? (
            <div className='detail-panel__content'>
              <div className='detail-panel__header'>
                <Title level={4}>{selectedAsset.name}</Title>
                <Badge
                  status={selectedAsset.status === 'offline' ? 'error' : 'processing'}
                  text={selectedAsset.status === 'offline' ? '资源库离线' : '可立即预览'}
                />
              </div>
              <Divider />
              <Space direction='vertical' size='middle' className='detail-panel__meta'>
                <Space direction='vertical' size={4}>
                  <Text type='secondary'>所属资源库</Text>
                  <Text>
                    {libraryOptions.find((library) => library.value === selectedAsset.library)?.label ??
                      selectedAsset.library}
                  </Text>
                </Space>
                <Space direction='vertical' size={4}>
                  <Text type='secondary'>文件路径</Text>
                  <Paragraph copyable ellipsis={{ rows: 2 }}>
                    {selectedAsset.path}
                  </Paragraph>
                </Space>
                <Space direction='vertical' size={4}>
                  <Text type='secondary'>文件大小</Text>
                  <Text>{formatFileSize(selectedAsset.size)}</Text>
                </Space>
                <Space direction='vertical' size={4}>
                  <Text type='secondary'>最近更新</Text>
                  <Text>{selectedAsset.updatedAt}</Text>
                </Space>
              </Space>
              <Divider />
              <Space direction='vertical' size='small'>
                <Text type='secondary'>标签</Text>
                <Space size={[8, 8]} wrap>
                  {selectedAsset.tags.map((tag) => (
                    <Tag key={tag} color='geekblue'>
                      {tag}
                    </Tag>
                  ))}
                </Space>
              </Space>
              <Divider />
              <Space direction='vertical' size='small'>
                <Text type='secondary'>描述</Text>
                <Paragraph>{selectedAsset.description}</Paragraph>
              </Space>
              <Divider />
              <Space direction='vertical' size='small'>
                <Text type='secondary'>下一步</Text>
                <Space size='small'>
                  <Button type='primary'>打开详情</Button>
                  <Button>打开所在目录</Button>
                </Space>
              </Space>
            </div>
          ) : (
            <Empty description='请选择左侧列表中的资产以查看详情' />
          )}
        </Sider>
      </Layout>
    </Layout>
  )
}

export default App
