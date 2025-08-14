---
id: KB1755151564-5F22
products:
  - Alauda Container Platform
kind:
  - Solution
sourceSHA: 0c252feaa4078d6fc9c5036f019f4e864971c1be6796478c741799828db932af
---

# 如何纠正大集群 ElasticSearch 中节点角色设置的问题

## 问题

大集群 ElasticSearch 从 ACP 版本 3.18.2 升级到 4.x 时会出现以下故障：`节点没有数据角色但有分片数据`

在升级之前，必须使用此解决方案来纠正节点角色设置。

## 环境

v3.18.2

## 诊断步骤

### 步骤 0：准备 ElasticSearch 连接信息

登录到集群中的控制节点

```shell
# 获取 ElasticSearch 连接详细信息和凭据
ES_HOST=$(kubectl -n cpaas-system get feature log-center -o jsonpath='{.spec.accessInfo.elasticsearch.address}')
USERNAME=$(kubectl -n cpaas-system get secrets elasticsearch-basic-auth -o yaml | grep username | awk '{print $2}' | base64 -d)
PASSWORD=$(kubectl -n cpaas-system get secrets elasticsearch-basic-auth -o yaml | grep password | awk '{print $2}' | base64 -d)
```

### 步骤 1：确保 ElasticSearch 准备就绪

执行以下命令以确保 ElasticSearch 状态为绿色

```shell
curl -sk -u $USERNAME:$PASSWORD "$ES_HOST/_cluster/health?pretty"

# 示例
{
  "cluster_name" : "prod-alauda",
  "status" : "green",
  ...
}
```

### 步骤 2：将 cpaas-elasticsearch 的角色修改为数据

执行以下命令以将 StatefulSet cpaas-elasticsearch 的角色编辑为数据：

```shell
kubectl edit statefulset -n cpaas-system cpaas-elasticsearch
```

参考以下内容进行修改：

```yaml
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  annotations:
    configmap.reloader.stakater.com/reload: es-config-v7
    secret.reloader.stakater.com/reload: elasticsearch-basic-auth,elasticsearch-node0-cert
  labels:
    service_name: cpaas-elasticsearch
  name: cpaas-elasticsearch
  namespace: cpaas-system
spec:
  ...
  template:
    ...
    spec:
      ...
      containers:
      - env:
        - name: CPU_LIMIT
          valueFrom:
            resourceFieldRef:
              containerName: cpaas-elasticsearch
              divisor: "0"
              resource: limits.cpu
        - name: MEM_LIMIT
          valueFrom:
            resourceFieldRef:
              containerName: cpaas-elasticsearch
              divisor: "0"
              resource: limits.memory
# 修改以下内容
        - name: node.data
          value: "true"
        - name: node.master
          value: "false"
# 改为：
        - name: node.roles
          value: "data"  
# 结束
        - name: ALAUDA_ES_CLUSTERS
          value: xxx.xxx.xx.xx,xxx.xxx.xx.xx,xxx.xxx.xx.xx
        - name: COMP_NAME
          value: elasticsearch
  ...
```

等待 Pod 运行

执行以下命令以检查 ElasticSearch 角色是否为数据

```shell
curl -sk -u $USERNAME:$PASSWORD "$ES_HOST/_cat/nodes?v" | grep -v cpaas-elasticsearch-master

# 示例：节点角色 `d` 表示数据
ip         heap.percent ram.percent cpu load_1m load_5m load_15m node.role master name
xx.x.x.xxx           29          88   3    0.82    0.98     1.17 d         -      cpaas-elasticsearch-2
xx.x.x.xxx           27          86   1    0.67    0.87     0.94 d         -      cpaas-elasticsearch-0
xx.x.x.xxx           55          88   1    1.01    0.96     1.35 d         -      cpaas-elasticsearch-1
```

### 步骤 3：禁止将分片分配给 ElasticSearch 主节点

执行以下命令以禁止将分片分配给 ElasticSearch 主节点

```shell
# 获取所有 ElasticSearch 主节点
ES_MASTER_NODES=$(kubectl get po -n cpaas-system --no-headers -o custom-columns=":metadata.name" | grep 'cpaas-elasticsearch-master' | paste -sd, -)

# 禁止将分片分配给主节点
curl -sk -X PUT -u "$USERNAME:$PASSWORD" "$ES_HOST/_cluster/settings" \
     -H 'Content-Type: application/json' \
     -d "{\"transient\": {\"cluster.routing.allocation.exclude._name\": \"$ES_MASTER_NODES\"}}"

# 检查集群设置是否已设置
curl -sk -u $USERNAME:$PASSWORD "$ES_HOST/_cluster/settings?pretty"

# 示例：
{
  "persistent" : { },
  "transient" : {
    "cluster" : {
      "routing" : {
        "allocation" : {
          "exclude" : {
            "_name" : "cpaas-elasticsearch-master-0,cpaas-elasticsearch-master-1,cpaas-elasticsearch-master-2"
          }
        }
      }
    }
  }
}
```

### 步骤 4：等待分配完成

执行以下命令以查看分片分配，直到主节点上没有分片为止：

```shell
curl -sk -u $USERNAME:$PASSWORD "$ES_HOST/_cat/shards?v" | grep cpaas-elasticsearch-master
```

### 步骤 5：将 cpaas-elasticsearch-master 的角色修改为主节点

执行以下命令以将 StatefulSet cpaas-elasticsearch-master 的角色编辑为主节点：

```shell
kubectl edit statefulset -n cpaas-system cpaas-elasticsearch-master
```

参考以下内容进行修改：

```yaml
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  annotations:
    configmap.reloader.stakater.com/reload: es-config-v7
    secret.reloader.stakater.com/reload: elasticsearch-basic-auth,elasticsearch-node0-cert
  labels:
    service_name: cpaas-elasticsearch
  name: cpaas-elasticsearch-master
  namespace: cpaas-system
spec:
  ...
  template:
    ...
    spec:
      ...
      containers:
      - env:
# 修改以下内容
          - name: node.data
            value: "false"
          - name: node.master
            value: "true"
# 改为：
          - name: node.roles
            value: "master"
# 结束  
        - name: ALAUDA_ES_CLUSTERS
          value: xxx.xxx.xx.xx,xxx.xxx.xx.xx,xxx.xxx.xx.xx
        - name: COMP_NAME
          value: elasticsearch
  ...
```

等待 Pod 运行

执行以下命令以检查 ElasticSearch 角色是否为主节点

```shell
curl -sk -u $USERNAME:$PASSWORD "$ES_HOST/_cat/nodes?v" | grep master

# 示例：节点角色 `m` 表示主节点
ip         heap.percent ram.percent cpu load_1m load_5m load_15m node.role master name
xx.x.x.xxx           39          59   0    0.48    0.73     1.05 m         *      cpaas-elasticsearch-master-2
xx.x.x.xxx           52          59   0    1.02    1.40     1.25 m         -      cpaas-elasticsearch-master-1
xx.x.x.xxx           29          59   0    0.85    0.91     1.06 m         -      cpaas-elasticsearch-master-0
```

### 步骤 6：恢复禁止将分片分配给主节点

执行以下命令以恢复禁止将分片分配给 ElasticSearch 主节点

```shell
curl -sk -X PUT -u "$USERNAME:$PASSWORD" "$ES_HOST/_cluster/settings" \
     -H 'Content-Type: application/json' \
     -d '{"transient": {"cluster.routing.allocation.exclude._name": null}}' 

# 检查集群设置是否已恢复
curl -sk -u $USERNAME:$PASSWORD "$ES_HOST/_cluster/settings?pretty"

# 示例：
{
  "persistent" : {},
  "transient" : {}
}
```
